import type { AccountProjectionState, ProfileUpdate } from "../types/account.js";
import type { AccountProjectionRow, Queryable } from "../types/database.js";
import { isRecord, isRecordArray } from "../utils/records.js";

/** Reads the public account response for a given email. */
export async function readAccountState(db: Queryable, email: string): Promise<Record<string, unknown>> {
  const account = await db.query(
    `select c.email,
            coalesce(ls.loyalty_points, 0) as loyalty_points,
            ls.loyalty_target,
            coalesce(ap.profile_json, jsonb_build_object('email', c.email)) as profile,
            coalesce(ap.bookings_json, '[]'::jsonb) as upcoming_bookings,
            coalesce(ap.waivers_json, '[]'::jsonb) as waivers,
            coalesce(
              json_agg(
                json_build_object(
                  'code', dc.code,
                  'status', dc.status,
                  'issuedAt', dc.issued_at,
                  'usedAt', dc.used_at
                )
              ) filter (where dc.code is not null),
              '[]'
            ) as discount_codes
     from customers c
     left join lateral (
       select loyalty_points, loyalty_target
       from loyalty_snapshots
       where customer_id = c.id
       order by received_at desc
       limit 1
     ) ls on true
     left join account_projection ap on ap.customer_id = c.id
     left join discount_codes dc on dc.customer_id = c.id
     where c.email = $1
     group by c.email, ls.loyalty_points, ls.loyalty_target, ap.profile_json, ap.bookings_json, ap.waivers_json`,
    [email]
  );

  return (
    account.rows[0] ?? {
      email,
      loyalty_points: 0,
      loyalty_target: null,
      profile: { email },
      upcoming_bookings: [],
      waivers: [],
      discount_codes: []
    }
  );
}

/** Loads the mutable account projection aggregates for a customer. */
export async function loadAccountProjection(db: Queryable, customerId: string): Promise<AccountProjectionState> {
  const result = await db.query<AccountProjectionRow>(
    `select profile_json, bookings_json, waivers_json
     from account_projection
     where customer_id = $1`,
    [customerId]
  );

  const row = result.rows[0];

  return {
    profile: isRecord(row?.profile_json) ? row.profile_json : {},
    upcomingBookings: isRecordArray(row?.bookings_json),
    waivers: isRecordArray(row?.waivers_json)
  };
}

/** Saves the mutable account projection aggregates for a customer. */
export async function saveAccountProjection(
  db: Queryable,
  customerId: string,
  profile: Record<string, unknown>,
  upcomingBookings: Record<string, unknown>[],
  waivers: Record<string, unknown>[],
  currentTime: Date
): Promise<void> {
  await db.query(
    `insert into account_projection (customer_id, profile_json, bookings_json, waivers_json, updated_at)
     values ($1, $2, $3, $4, $5)
     on conflict (customer_id) do update
     set profile_json = excluded.profile_json,
         bookings_json = excluded.bookings_json,
         waivers_json = excluded.waivers_json,
         updated_at = excluded.updated_at`,
    [customerId, profile, upcomingBookings, waivers, currentTime]
  );
}

/** Merges profile details into the stored account projection. */
export function mergeProfile(existing: Record<string, unknown>, incoming: ProfileUpdate): Record<string, unknown> {
  const next: Record<string, unknown> = { ...existing, email: incoming.email };

  if (incoming.firstName) {
    next.firstName = incoming.firstName;
  }

  if (incoming.lastName) {
    next.lastName = incoming.lastName;
  }

  if (incoming.phone) {
    next.phone = incoming.phone;
  }

  const displayName = incoming.name ?? [incoming.firstName, incoming.lastName].filter(Boolean).join(" ").trim();
  if (displayName) {
    next.name = displayName;
  }

  return next;
}
