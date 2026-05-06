import type { CustomerRefs, Queryable } from "../types/database.js";
import { stringOrUndefined } from "../utils/primitives.js";

interface WebhookRecordMetadata {
  providerEventId?: unknown;
  eventDate?: unknown;
  sendDate?: unknown;
}

let webhookMetadataColumnsReady = false;
let customerIdentityColumnsReady = false;

/** Persists a raw webhook event payload for traceability. */
export async function recordWebhook(
  db: Queryable,
  type: string,
  payload: unknown,
  metadata?: WebhookRecordMetadata
): Promise<void> {
  const insertParams = [
    type,
    payload,
    stringOrUndefined(metadata?.providerEventId) ?? null,
    toDateOrNull(metadata?.eventDate),
    toDateOrNull(metadata?.sendDate),
    new Date()
  ];

  try {
    await insertWebhookWithMetadata(db, insertParams);
  } catch (error) {
    if (!isWebhookMetadataSchemaMismatch(error)) {
      throw error;
    }

    await ensureWebhookMetadataColumns(db);
    await insertWebhookWithMetadata(db, insertParams);

    console.info({
      type: "webhook_events_schema_behind",
      action: "auto_migrated_and_retried_insert",
      reason: "missing_webhook_metadata_columns"
    });
  }
}

async function insertWebhookWithMetadata(db: Queryable, params: unknown[]): Promise<void> {
  await db.query(
    `insert into webhook_events (type, payload, provider_event_id, event_date, send_date, attempted_at)
     values ($1, $2, $3, $4, $5, $6)`,
    params
  );
}

async function ensureWebhookMetadataColumns(db: Queryable): Promise<void> {
  if (webhookMetadataColumnsReady) {
    return;
  }

  await db.query("alter table webhook_events add column if not exists provider_event_id text");
  await db.query("alter table webhook_events add column if not exists event_date timestamptz");
  await db.query("alter table webhook_events add column if not exists send_date timestamptz");
  await db.query("alter table webhook_events add column if not exists attempted_at timestamptz not null default now()");

  webhookMetadataColumnsReady = true;
}

/** Finds a customer id by normalized email. */
export async function findCustomerIdByEmail(db: Queryable, email: string): Promise<string | undefined> {
  const result = await db.query<{ id: string }>(
    `select id
     from customers
     where email = $1
     limit 1`,
    [email]
  );

  return result.rows[0]?.id;
}

/** Finds a customer id by normalized phone number. */
export async function findCustomerIdByPhone(db: Queryable, phone: string): Promise<string | undefined> {
  try {
    const result = await db.query<{ id: string }>(
      `select id
       from customers
       where phone = $1
       limit 1`,
      [normalizePhone(phone)]
    );

    return result.rows[0]?.id;
  } catch (error) {
    if (!isCustomerIdentitySchemaMismatch(error)) {
      throw error;
    }

    await ensureCustomerIdentityColumns(db);
    const result = await db.query<{ id: string }>(
      `select id
       from customers
       where phone = $1
       limit 1`,
      [normalizePhone(phone)]
    );

    console.info({
      type: "customers_schema_behind",
      action: "auto_migrated_and_retried_phone_lookup",
      reason: "missing_customer_identity_columns"
    });

    return result.rows[0]?.id;
  }
}

/** Finds a customer id by ROLLER numeric customer id stored as text. */
export async function findCustomerIdByRollerCustomerId(db: Queryable, rollerCustomerId: string): Promise<string | undefined> {
  try {
    const result = await db.query<{ id: string }>(
      `select id
       from customers
       where roller_customer_id = $1
       limit 1`,
      [rollerCustomerId]
    );

    return result.rows[0]?.id;
  } catch (error) {
    if (!isCustomerIdentitySchemaMismatch(error)) {
      throw error;
    }

    await ensureCustomerIdentityColumns(db);
    const result = await db.query<{ id: string }>(
      `select id
       from customers
       where roller_customer_id = $1
       limit 1`,
      [rollerCustomerId]
    );

    console.info({
      type: "customers_schema_behind",
      action: "auto_migrated_and_retried_roller_customer_lookup",
      reason: "missing_customer_identity_columns"
    });

    return result.rows[0]?.id;
  }
}

/** Upserts a customer row and returns the internal customer id. */
export async function upsertCustomer(db: Queryable, refs: CustomerRefs): Promise<string> {
  try {
    return await upsertCustomerInternal(db, refs);
  } catch (error) {
    if (!isCustomerIdentitySchemaMismatch(error)) {
      throw error;
    }

    await ensureCustomerIdentityColumns(db);
    const customerId = await upsertCustomerInternal(db, refs);
    console.info({
      type: "customers_schema_behind",
      action: "auto_migrated_and_retried_upsert",
      reason: "missing_customer_identity_columns"
    });
    return customerId;
  }
}

async function upsertCustomerInternal(db: Queryable, refs: CustomerRefs): Promise<string> {
  const email = normalizeEmail(refs.email);
  const phone = normalizePhone(refs.phone);
  const patchContactId = stringOrUndefined(refs.patchContactId);
  const rollerCustomerId = stringOrUndefined(refs.rollerCustomerId);
  const name = stringOrUndefined(refs.name);
  const homeParkId = stringOrUndefined(refs.homeParkId);
  const homeParkName = stringOrUndefined(refs.homeParkName);

  if (!email && !phone) {
    throw new Error("customer_identifier_required");
  }

  const customerIdByEmail = email ? await findCustomerIdByEmail(db, email) : undefined;
  const customerIdByPhone = phone ? await findCustomerIdByPhone(db, phone) : undefined;

  let customerId = customerIdByEmail ?? customerIdByPhone;

  if (customerIdByEmail && customerIdByPhone && customerIdByEmail !== customerIdByPhone) {
    customerId = await mergeCustomerAccounts(db, customerIdByEmail, customerIdByPhone);
  }

  if (!customerId) {
    const inserted = await db.query<{ id: string }>(
      `insert into customers (email, phone, name, patch_contact_id, roller_customer_id, home_park_id, home_park_name)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id`,
      [email ?? null, phone ?? null, name ?? null, patchContactId ?? null, rollerCustomerId ?? null, homeParkId ?? null, homeParkName ?? null]
    );

    return inserted.rows[0].id;
  }

  const updated = await db.query<{ id: string }>(
    `update customers
     set email = coalesce($2, email),
         phone = coalesce($3, phone),
         name = coalesce($4, name),
         patch_contact_id = coalesce($5, patch_contact_id),
         roller_customer_id = coalesce($6, roller_customer_id),
         home_park_id = coalesce($7, home_park_id),
         home_park_name = coalesce($8, home_park_name),
         updated_at = now()
     where id = $1
     returning id`,
    [customerId, email ?? null, phone ?? null, name ?? null, patchContactId ?? null, rollerCustomerId ?? null, homeParkId ?? null, homeParkName ?? null]
  );

  return updated.rows[0].id;
}

async function ensureCustomerIdentityColumns(db: Queryable): Promise<void> {
  if (customerIdentityColumnsReady) {
    return;
  }

  await db.query("alter table customers add column if not exists phone text");
  await db.query("alter table customers add column if not exists name text");
  await db.query("create unique index if not exists customers_phone_key on customers(phone)");
  await db.query("alter table customers add column if not exists home_park_id text");
  await db.query("alter table customers add column if not exists home_park_name text");
  await db.query("alter table customers add column if not exists loyalty_points integer not null default 0");
  await db.query("alter table customers add column if not exists loyalty_target integer");
  await db.query("alter table customers add column if not exists waiver_status text");
  await db.query("alter table customers add column if not exists waiver_signed_at timestamptz");
  await db.query("alter table customers add column if not exists waiver_expiry_date timestamptz");
  await db.query("alter table customers alter column email drop not null");

  customerIdentityColumnsReady = true;
}

async function mergeCustomerAccounts(db: Queryable, primaryCustomerId: string, secondaryCustomerId: string): Promise<string> {
  if (primaryCustomerId === secondaryCustomerId) {
    return primaryCustomerId;
  }

  await db.query("begin");
  try {
    await db.query(
      `update customers primary_customer
      set email = coalesce(primary_customer.email, secondary_customer.email),
           phone = coalesce(primary_customer.phone, secondary_customer.phone),
           name = coalesce(primary_customer.name, secondary_customer.name),
           patch_contact_id = coalesce(primary_customer.patch_contact_id, secondary_customer.patch_contact_id),
           roller_customer_id = coalesce(primary_customer.roller_customer_id, secondary_customer.roller_customer_id),
           home_park_id = coalesce(primary_customer.home_park_id, secondary_customer.home_park_id),
           home_park_name = coalesce(primary_customer.home_park_name, secondary_customer.home_park_name),
           loyalty_points = greatest(primary_customer.loyalty_points, secondary_customer.loyalty_points),
           loyalty_target = coalesce(primary_customer.loyalty_target, secondary_customer.loyalty_target),
           waiver_status = coalesce(primary_customer.waiver_status, secondary_customer.waiver_status),
           waiver_signed_at = coalesce(primary_customer.waiver_signed_at, secondary_customer.waiver_signed_at),
           waiver_expiry_date = coalesce(primary_customer.waiver_expiry_date, secondary_customer.waiver_expiry_date),
           updated_at = now()
       from customers secondary_customer
       where primary_customer.id = $1
         and secondary_customer.id = $2`,
      [primaryCustomerId, secondaryCustomerId]
    );

    await db.query(
      `update discount_codes
       set customer_id = $1
       where customer_id = $2`,
      [primaryCustomerId, secondaryCustomerId]
    );
    await db.query(
      `update bookings
       set customer_id = $1
       where customer_id = $2`,
      [primaryCustomerId, secondaryCustomerId]
    );

    await db.query("delete from customers where id = $1", [secondaryCustomerId]);
    await db.query("commit");
    return primaryCustomerId;
  } catch (error) {
    await db.query("rollback");
    throw error;
  }
}

function normalizeEmail(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return undefined;
  }

  return normalized;
}

function normalizePhone(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const hasPlusPrefix = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 0) {
    return undefined;
  }

  return hasPlusPrefix ? `+${digits}` : digits;
}

function toDateOrNull(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWebhookMetadataSchemaMismatch(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const pgError = error as { code?: unknown; message?: unknown };
  if (pgError.code !== "42703" || typeof pgError.message !== "string") {
    return false;
  }

  return (
    pgError.message.includes("provider_event_id") ||
    pgError.message.includes("event_date") ||
    pgError.message.includes("send_date") ||
    pgError.message.includes("attempted_at")
  );
}

function isCustomerIdentitySchemaMismatch(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const pgError = error as { code?: unknown; message?: unknown };
  if (pgError.code !== "42703" && pgError.code !== "23502") {
    return false;
  }

  if (typeof pgError.message !== "string") {
    return false;
  }

  return (
    pgError.message.includes("roller_customer_id") ||
    pgError.message.includes("phone") ||
    pgError.message.includes("name") ||
    pgError.message.includes("home_park_id") ||
    pgError.message.includes("home_park_name") ||
    pgError.message.includes("loyalty_points") ||
    pgError.message.includes("loyalty_target") ||
    pgError.message.includes("waiver_status") ||
    pgError.message.includes("waiver_signed_at") ||
    pgError.message.includes("waiver_expiry_date") ||
    pgError.message.includes("null value in column \"email\"")
  );
}
