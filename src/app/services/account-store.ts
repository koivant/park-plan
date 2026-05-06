import type { Queryable } from "../types/database.js";

/** Reads the public account response for a given email. */
export async function readAccountState(db: Queryable, email: string): Promise<Record<string, unknown>> {
  const account = await db.query(
    `select c.email,
            c.loyalty_points,
            c.loyalty_target,
            case
              when c.home_park_id is not null or c.home_park_name is not null
                then json_build_object('parkId', c.home_park_id, 'parkName', c.home_park_name)
              else null
            end as home_park,
            coalesce(vp.visited_parks, '[]'::json) as visited_parks,
            jsonb_strip_nulls(
              jsonb_build_object(
                'email', c.email,
                'name', c.name,
                'phone', c.phone
              )
            ) as profile,
            coalesce(bk.bookings, '[]'::json) as upcoming_bookings,
            case
              when c.waiver_status is null then '[]'::json
              else json_build_array(
                json_build_object(
                  'status', c.waiver_status,
                  'signedAt', c.waiver_signed_at,
                  'expiryDate', c.waiver_expiry_date
                )
              )
            end as waivers,
            coalesce(dc.discount_codes, '[]'::json) as discount_codes
     from customers c
     left join lateral (
       select coalesce(
         json_agg(
           json_build_object(
             'bookingId', b.booking_id,
             'bookingReference', b.booking_reference,
             'rollerCustomerId', b.roller_customer_id,
             'parkId', b.park_id,
             'venue', b.park_name,
             'startsAt', b.starts_at,
             'ticketCount', b.ticket_count,
             'status', b.status,
             'bookingDate', b.booking_date,
             'bookingEndDate', b.booking_end_date
           )
           order by b.last_event_date desc nulls last, b.updated_at desc
         ),
         '[]'::json
       ) as bookings
       from bookings b
       where b.customer_id = c.id
     ) bk on true
     left join lateral (
       select coalesce(
         json_agg(
           json_build_object(
             'code', dc.code,
             'used', dc.is_used,
             'issuedAt', dc.issued_at,
             'usedAt', dc.used_at
           )
           order by dc.issued_at desc
         ),
         '[]'::json
       ) as discount_codes
       from discount_codes dc
       where dc.customer_id = c.id
     ) dc on true
     left join lateral (
       select coalesce(
         json_agg(
           json_build_object(
             'parkId', v.park_id,
             'parkName', v.park_name,
             'firstSeenAt', v.first_seen_at,
             'lastSeenAt', v.last_seen_at,
             'visitCount', v.visit_count
           )
           order by v.last_seen_at desc
         ),
         '[]'::json
       ) as visited_parks
       from (
         select b.park_id,
                max(b.park_name) as park_name,
                min(coalesce(b.starts_at, b.last_event_date, b.created_at)) as first_seen_at,
                max(coalesce(b.starts_at, b.last_event_date, b.created_at)) as last_seen_at,
                count(distinct b.booking_id)::int as visit_count
         from bookings b
         where b.customer_id = c.id
           and b.park_id is not null
         group by b.park_id
       ) v
     ) vp on true
     where c.email = $1`,
    [email]
  );

  return (
    account.rows[0] ?? {
      email,
      loyalty_points: 0,
      loyalty_target: null,
      home_park: null,
      visited_parks: [],
      profile: { email },
      upcoming_bookings: [],
      waivers: [],
      discount_codes: []
    }
  );
}

/** Finds a customer id by booking id. */
export async function findCustomerIdByBookingId(db: Queryable, bookingId: string): Promise<string | undefined> {
  const result = await db.query<{ customer_id: string }>(
    `select customer_id
     from bookings
     where booking_id = $1
       and customer_id is not null
     limit 1`,
    [bookingId]
  );

  return result.rows[0]?.customer_id;
}

interface UpsertBookingInput {
  bookingId: string;
  customerId?: string;
  bookingReference?: string;
  rollerCustomerId?: string;
  parkId?: string;
  parkName?: string;
  source?: string;
  channel?: string;
  bookingDate?: string;
  bookingEndDate?: string;
  startsAt?: string;
  ticketCount?: number;
  status?: string;
  lastEventType: string;
  lastEventDate?: string;
  providerEventId?: string;
}

/** Upserts a normalized booking record. */
export async function upsertBooking(db: Queryable, input: UpsertBookingInput): Promise<void> {
  await db.query(
    `insert into bookings (
       booking_id,
       customer_id,
       booking_reference,
       roller_customer_id,
       park_id,
       park_name,
       source,
       channel,
       booking_date,
       booking_end_date,
       starts_at,
       ticket_count,
       status,
       last_event_type,
       last_event_date,
       provider_event_id,
       updated_at
     )
     values (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6,
       $7,
       $8,
       $9::date,
       $10::date,
       $11::timestamptz,
       $12,
       $13,
       $14,
       $15::timestamptz,
       $16,
       now()
     )
     on conflict (booking_id) do update
     set customer_id = coalesce(excluded.customer_id, bookings.customer_id),
         booking_reference = coalesce(excluded.booking_reference, bookings.booking_reference),
         roller_customer_id = coalesce(excluded.roller_customer_id, bookings.roller_customer_id),
         park_id = coalesce(excluded.park_id, bookings.park_id),
         park_name = coalesce(excluded.park_name, bookings.park_name),
         source = coalesce(excluded.source, bookings.source),
         channel = coalesce(excluded.channel, bookings.channel),
         booking_date = coalesce(excluded.booking_date, bookings.booking_date),
         booking_end_date = coalesce(excluded.booking_end_date, bookings.booking_end_date),
         starts_at = coalesce(excluded.starts_at, bookings.starts_at),
         ticket_count = coalesce(excluded.ticket_count, bookings.ticket_count),
         status = coalesce(excluded.status, bookings.status),
         last_event_type = excluded.last_event_type,
         last_event_date = coalesce(excluded.last_event_date, bookings.last_event_date),
         provider_event_id = coalesce(excluded.provider_event_id, bookings.provider_event_id),
         updated_at = now()`,
    [
      input.bookingId,
      input.customerId ?? null,
      input.bookingReference ?? null,
      input.rollerCustomerId ?? null,
      input.parkId ?? null,
      input.parkName ?? null,
      input.source ?? null,
      input.channel ?? null,
      input.bookingDate ?? null,
      input.bookingEndDate ?? null,
      input.startsAt ?? null,
      input.ticketCount ?? null,
      input.status ?? null,
      input.lastEventType,
      input.lastEventDate ?? null,
      input.providerEventId ?? null
    ]
  );
}

interface UpdateCustomerWaiverStatusInput {
  customerId: string;
  status: string;
  signedAt?: string;
  expiryDate?: string;
}

/** Persists latest waiver status directly on customer row. */
export async function updateCustomerWaiverStatus(db: Queryable, input: UpdateCustomerWaiverStatusInput): Promise<void> {
  await db.query(
    `update customers
     set waiver_status = $2,
         waiver_signed_at = coalesce($3::timestamptz, waiver_signed_at),
         waiver_expiry_date = coalesce($4::timestamptz, waiver_expiry_date),
         updated_at = now()
     where id = $1`,
    [input.customerId, input.status, input.signedAt ?? null, input.expiryDate ?? null]
  );
}
