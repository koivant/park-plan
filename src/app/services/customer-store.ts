import type { CustomerRefs, Queryable } from "../types/database.js";

/** Persists a raw webhook event payload for traceability. */
export async function recordWebhook(db: Queryable, type: string, payload: unknown): Promise<void> {
  await db.query("insert into webhook_events (type, payload) values ($1, $2)", [type, payload]);
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

/** Upserts a customer row and returns the internal customer id. */
export async function upsertCustomer(db: Queryable, refs: CustomerRefs): Promise<string> {
  const result = await db.query<{ id: string }>(
    `insert into customers (email, patch_contact_id, roller_customer_id)
     values ($1, $2, $3)
     on conflict (email) do update
     set patch_contact_id = coalesce(excluded.patch_contact_id, customers.patch_contact_id),
         roller_customer_id = coalesce(excluded.roller_customer_id, customers.roller_customer_id)
     returning id`,
    [
      refs.email,
      typeof refs.patchContactId === "string" ? refs.patchContactId : null,
      typeof refs.rollerCustomerId === "string" ? refs.rollerCustomerId : null
    ]
  );

  return result.rows[0].id;
}
