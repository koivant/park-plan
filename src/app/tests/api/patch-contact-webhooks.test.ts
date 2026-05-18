import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { patchContactUpdatedPayload } from "../mocks/patch.js";
import { createDb, createResult } from "../helpers/db.js";

describe("PATCH contact webhook API routes", () => {
  it("POST /webhooks/patch/contact-updated records the webhook and updates customer loyalty fields", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/patch/contact-updated").send({
      ...patchContactUpdatedPayload
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("patch.contact_updated");
    expect(db.calls[1].params).toEqual(["user@example.com"]);
    expect(db.calls[2].params).toEqual(["user@example.com", null, null, "patch-id", null, null, null]);
    expect(db.calls[3].params?.slice(0, 3)).toEqual(["customer-id", 4, 10]);
  });

  it("POST /webhooks/patch/:location/contact-updated uses location as customer home park", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/patch/glasgow/contact-updated").send({
      ...patchContactUpdatedPayload
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("patch.contact_updated");
    expect(db.calls[2].params).toEqual(["user@example.com", null, null, "patch-id", null, "glasgow", "glasgow"]);
    expect(db.calls[3].params?.slice(0, 3)).toEqual(["customer-id", 4, 10]);
  });

  it("POST /webhooks/patch/contact-updated auto-migrates webhook metadata columns and retries insert", async () => {
    const db = createDb((text, params) => {
      if (text.includes("insert into webhook_events") && text.includes("provider_event_id")) {
        if (params?.[2] === null) {
          const retryMarker = db.calls.filter((call) => call.text.includes("insert into webhook_events")).length;
          if (retryMarker === 1) {
            const error = new Error('column "provider_event_id" of relation "webhook_events" does not exist') as Error & {
              code?: string;
            };
            error.code = "42703";
            throw error;
          }
        }
      }

      if (text.startsWith("alter table webhook_events")) {
        return createResult();
      }

      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/patch/contact-updated").send({
      ...patchContactUpdatedPayload
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls.some((call) => call.text.includes("insert into webhook_events (type, payload)"))).toBe(false);
    expect(db.calls.filter((call) => call.text.includes("insert into webhook_events")).length).toBe(2);
    expect(db.calls.filter((call) => call.text.startsWith("alter table webhook_events")).length).toBe(4);
  });

  it("POST /webhooks/patch/contact-updated ingests punchcard and phone from PATCH payload", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/patch/contact-updated").send({
      punchcard: "2",
      email: "pabel@noemail.com",
      phone: "442332323232"
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(5);
    expect(db.calls[3].params).toEqual(["pabel@noemail.com", "442332323232", null, null, null, null, null]);
    expect(db.calls[4].params?.slice(0, 3)).toEqual(["customer-id", 2, null]);
  });

  it("POST /webhooks/patch/contact-updated matches existing customer by roller_id and updates that record", async () => {
    const db = createDb((text, params) => {
      if (text.includes("where email = $1")) {
        return createResult([], 0);
      }

      if (text.includes("where phone = $1")) {
        return createResult([], 0);
      }

      if (text.includes("where roller_customer_id = $1")) {
        return createResult([{ id: "existing-customer-id" }], 1);
      }

      if (text.includes("update customers") && text.includes("returning id")) {
        return createResult([{ id: "existing-customer-id" }], 1);
      }

      if (text.includes("update customers") && text.includes("set loyalty_points = $2")) {
        return createResult([], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/patch/contact-updated").send({
      discount_code: "",
      email: "antti.koivisto+6@qvik.fi",
      phone: "4434343443",
      roller_id: "97841376"
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls.some((call) => JSON.stringify(call.params) === JSON.stringify(["97841376"]))).toBe(true);
    expect(
      db.calls.some(
        (call) =>
          JSON.stringify(call.params) ===
          JSON.stringify([
            "existing-customer-id",
            "antti.koivisto+6@qvik.fi",
            "4434343443",
            null,
            null,
            "97841376",
            null,
            null
          ])
      )
    ).toBe(true);
    expect(db.calls.some((call) => JSON.stringify(call.params?.slice(0, 3)) === JSON.stringify(["existing-customer-id", 0, null]))).toBe(true);
  });

  it("POST /webhooks/patch/contact-updated auto-migrates customers identity columns and retries upsert", async () => {
    const db = createDb((text) => {
      if (text.includes("insert into customers")) {
        const insertAttempts = db.calls.filter((call) => call.text.includes("insert into customers")).length;
        if (insertAttempts === 1) {
          const error = new Error('column "phone" of relation "customers" does not exist') as Error & { code?: string };
          error.code = "42703";
          throw error;
        }
      }

      if (text.startsWith("alter table customers") || text.startsWith("create unique index if not exists customers_phone_key")) {
        return createResult();
      }

      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/patch/contact-updated").send({
      punchcard: "2",
      email: "pabel@noemail.com",
      phone: "442332323232"
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls.filter((call) => call.text.includes("insert into customers")).length).toBe(2);
    expect(db.calls.filter((call) => call.text.startsWith("alter table customers")).length).toBe(11);
    expect(db.calls.some((call) => call.text.startsWith("create unique index if not exists customers_phone_key"))).toBe(true);
  });

  it("POST /webhooks/patch/contact-updated accepts requests without webhook auth", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600, patchApiKey: "patch-secret" }
    });

    const response = await request(app).post("/webhooks/patch/contact-updated").send({
      ...patchContactUpdatedPayload
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("patch.contact_updated");
  });
});
