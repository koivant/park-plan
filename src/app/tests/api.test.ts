import type { QueryResult, QueryResultRow } from "pg";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp, type Queryable } from "../app.js";
import {
  existingAccountProjectionRow,
  rollerBookingWebhookPayload,
  rollerSignedWaiverWebhookPayload
} from "./mocks/roller.js";
import { patchContactUpdatedPayload, patchRewardCodeWebhookPayload } from "./mocks/patch.js";

interface QueryCall {
  text: string;
  params?: unknown[];
}

function createResult<T extends QueryResultRow>(rows: T[] = [], rowCount = rows.length): QueryResult<T> {
  return {
    rows,
    rowCount,
    command: "",
    oid: 0,
    fields: []
  };
}

function createDb(handler: (text: string, params?: unknown[]) => QueryResult<QueryResultRow>): Queryable & { calls: QueryCall[] } {
  const calls: QueryCall[] = [];

  return {
    calls,
    async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
      calls.push({ text, params });
      return handler(text, params) as QueryResult<T>;
    }
  };
}

describe("API endpoints", () => {
  it("GET /openapi/openapi.json returns the OpenAPI document", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).get("/openapi/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths["/health"]).toBeDefined();
    expect(response.headers["content-type"]).toContain("application/json");
  });

  it("GET /docs returns a browsable OpenAPI docs page", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).get("/docs");

    expect(response.status).toBe(200);
    expect(response.text).toContain("SwaggerUIBundle");
    expect(response.text).toContain("/openapi/openapi.json");
    expect(response.text).toContain("<title>Loyalty Demo API Docs</title>");
    expect(response.headers["content-type"]).toContain("text/html");
  });

  it("logs request metadata for incoming REST calls", async () => {
    const db = createDb(() => createResult([{ now: new Date("2026-01-01T00:00:00.000Z") }]));
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "http_request",
        method: "GET",
        path: "/health",
        statusCode: 200
      })
    );
    expect(consoleInfo.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        durationMs: expect.any(Number)
      })
    );

    consoleInfo.mockRestore();
  });

  it("logs endpoint action and payload for REST calls", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 },
      now: () => new Date("2026-01-01T00:00:00.000Z"),
      randomOtp: () => "123456"
    });
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    const response = await request(app).post("/auth/otp/request").send({ email: "user@example.com" });

    expect(response.status).toBe(200);
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "http_request",
        method: "POST",
        path: "/auth/otp/request",
        action: "Create a one-time password for authentication",
        payload: {
          body: { email: "user@example.com" }
        }
      })
    );

    consoleInfo.mockRestore();
  });

  it("logs incoming webhook payloads on request start", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    const response = await request(app).post("/webhooks/roller/booking").send({
      type: "Booking",
      eventType: "Created",
      data: {
        bookingReference: "booking-1"
      }
    });

    expect(response.status).toBe(202);
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "http_webhook_received",
        method: "POST",
        path: "/webhooks/roller/booking",
        action: "Ingest ROLLER booking webhook",
        payload: {
          body: {
            type: "Booking",
            eventType: "Created",
            data: {
              bookingReference: "booking-1"
            }
          }
        }
      })
    );

    consoleInfo.mockRestore();
  });

  it("GET /health returns database status", async () => {
    const db = createDb(() => createResult([{ now: new Date("2026-01-01T00:00:00.000Z") }]));
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      databaseTime: "2026-01-01T00:00:00.000Z"
    });
  });

  it("POST /auth/otp/request validates email and creates an OTP", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 },
      now: () => new Date("2026-01-01T00:00:00.000Z"),
      randomOtp: () => "123456"
    });

    const response = await request(app).post("/auth/otp/request").send({ email: " USER@Example.COM " });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      message: "OTP created for demo environment",
      demoOtp: "123456"
    });
    expect(db.calls[0].params?.[0]).toBe("user@example.com");
    expect(db.calls[0].params?.[2]).toEqual(new Date("2026-01-01T00:10:00.000Z"));
  });

  it("POST /auth/otp/request rejects missing email", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).post("/auth/otp/request").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "email_required" });
    expect(db.calls).toHaveLength(0);
  });

  it("POST /auth/otp/verify returns a session token for a valid OTP", async () => {
    const db = createDb(() => createResult([{ id: "otp-id" }], 1));
    const app = createApp({
      db,
      randomUUID: () => "session-token"
    });

    const response = await request(app)
      .post("/auth/otp/verify")
      .send({ email: "user@example.com", otp: "123456" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, sessionToken: "session-token" });
  });

  it("POST /auth/otp/verify rejects an invalid OTP", async () => {
    const db = createDb(() => createResult([], 0));
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app)
      .post("/auth/otp/verify")
      .send({ email: "user@example.com", otp: "123456" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "invalid_otp" });
  });

  it("GET /account returns a default account when no customer exists", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).get("/account").query({ email: "USER@example.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      email: "user@example.com",
      loyalty_points: 0,
      loyalty_target: null,
      home_park: null,
      visited_parks: [],
      profile: {
        email: "user@example.com"
      },
      upcoming_bookings: [],
      waivers: [],
      discount_codes: []
    });
  });

  it("GET /account returns the merged projection needed by the customer web view", async () => {
    const db = createDb(() =>
      createResult([
        {
          email: "user@example.com",
          loyalty_points: 7,
          loyalty_target: 10,
          home_park: {
            parkId: "69184",
            parkName: "SuperPark Vantaa"
          },
          visited_parks: [
            {
              parkId: "69184",
              parkName: "SuperPark Vantaa",
              firstSeenAt: "2026-05-01T09:00:00.000Z",
              lastSeenAt: "2026-05-03T09:00:00.000Z",
              visitCount: 2
            }
          ],
          profile: {
            email: "user@example.com",
            name: "Taylor Example",
            phone: "+358401234567"
          },
          upcoming_bookings: [
            {
              bookingId: "booking-1",
              venue: "SuperPark Vantaa",
              startsAt: "2026-05-02T10:00:00.000Z",
              ticketCount: 3,
              status: "confirmed"
            }
          ],
          waivers: [
            {
              waiverId: "waiver-1",
              status: "signed",
              documentUrl: "https://example.com/waivers/waiver-1.pdf"
            }
          ],
          discount_codes: [
            {
              code: "FREE-1",
              used: false,
              issuedAt: "2026-05-01T09:00:00.000Z",
              usedAt: null
            }
          ]
        }
      ])
    );
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).get("/account").query({ email: "user@example.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      email: "user@example.com",
      loyalty_points: 7,
      loyalty_target: 10,
      home_park: {
        parkId: "69184",
        parkName: "SuperPark Vantaa"
      },
      visited_parks: [
        {
          parkId: "69184",
          parkName: "SuperPark Vantaa",
          firstSeenAt: "2026-05-01T09:00:00.000Z",
          lastSeenAt: "2026-05-03T09:00:00.000Z",
          visitCount: 2
        }
      ],
      profile: {
        email: "user@example.com",
        name: "Taylor Example",
        phone: "+358401234567"
      },
      upcoming_bookings: [
        {
          bookingId: "booking-1",
          venue: "SuperPark Vantaa",
          startsAt: "2026-05-02T10:00:00.000Z",
          ticketCount: 3,
          status: "confirmed"
        }
      ],
      waivers: [
        {
          waiverId: "waiver-1",
          status: "signed",
          documentUrl: "https://example.com/waivers/waiver-1.pdf"
        }
      ],
      discount_codes: [
        {
          code: "FREE-1",
          used: false,
          issuedAt: "2026-05-01T09:00:00.000Z",
          usedAt: null
        }
      ]
    });
  });

  it("POST /webhooks/patch/contact-updated records the webhook and updates customer loyalty fields", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
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
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
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
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
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
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/patch/contact-updated").send({
      punchcard: "2",
      email: "pabel@noemail.com",
      phone: "442332323232"
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls.filter((call) => call.text.includes("insert into customers")).length).toBe(2);
    expect(db.calls.filter((call) => call.text.startsWith("alter table customers")).length).toBe(10);
    expect(db.calls.some((call) => call.text.startsWith("create unique index if not exists customers_phone_key"))).toBe(true);
  });

  it("POST /webhooks/patch/contact-updated rejects unauthorized requests when webhook auth key is configured", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600, patchApiKey: "patch-secret" }
    });

    const response = await request(app).post("/webhooks/patch/contact-updated").send({
      ...patchContactUpdatedPayload
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "unauthorized" });
    expect(db.calls).toHaveLength(0);
  });

  it("POST /webhooks/patch/reward-code accepts x-api-key when webhook auth key is configured", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600, patchApiKey: "patch-secret" }
    });

    const response = await request(app)
      .post("/webhooks/patch/reward-code")
      .set("x-api-key", "patch-secret")
      .send({
        ...patchRewardCodeWebhookPayload
      });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("patch.reward_code");
  });

  it("POST /webhooks/patch/reward-code records codes for a customer", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/patch/reward-code").send({
      ...patchRewardCodeWebhookPayload
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("patch.reward_code");
    expect(db.calls[1].params).toEqual(["user@example.com"]);
    expect(db.calls[2].params).toEqual(["user@example.com", null, null, null, null, null, null]);
    expect(db.calls[3].params?.slice(0, 2)).toEqual(["customer-id", "FREE-1"]);
  });

  it("POST /webhooks/roller/booking records the webhook and persists customer + booking data", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/roller/booking").send(rollerBookingWebhookPayload);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(8);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[1].params).toEqual(["user@example.com"]);
    expect(db.calls[2].params).toEqual(["+358401234567"]);
    expect(db.calls[4].params).toEqual(["user@example.com"]);
    expect(db.calls[5].params).toEqual(["+358401234567"]);
    expect(db.calls[6].params).toEqual(["user@example.com", "+358401234567", "Taylor Example", null, "123456", null, null]);
    expect(db.calls[7].params).toEqual([
      "booking-1",
      "customer-id",
      "booking-1",
      "123456",
      "69184",
      "SuperPark Vantaa",
      null,
      null,
      "2026-05-02",
      null,
      "2026-05-02T10:00:00.000Z",
      3,
      "confirmed",
      "Created",
      "2026-05-02T09:45:00.000Z",
      "67d2ada6-10cc-4177-909d-430f3b2593d4"
    ]);
  });

  it("POST /webhooks/roller/booking accepts numeric webhook type and eventType IDs", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/roller/booking").send({
      ...rollerBookingWebhookPayload,
      type: 1,
      eventType: 1
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(8);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
  });

  it("POST /webhooks/roller/booking accepts data wrapped under data.booking", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/roller/booking").send({
      ...rollerBookingWebhookPayload,
      type: 1,
      eventType: 1,
      data: {
        booking: rollerBookingWebhookPayload.data
      }
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(8);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
  });

  it("POST /webhooks/roller/booking skips contact sync when enrollment is not allowed and customer does not exist", async () => {
    const db = createDb(() => createResult());
    const app = createApp({ db });
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    const response = await request(app).post("/webhooks/roller/booking").send({
      ...rollerBookingWebhookPayload,
      data: {
        ...rollerBookingWebhookPayload.data,
        customerFlags: []
      }
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[1].params).toEqual(["user@example.com"]);
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "roller_booking_contact_sync_skipped",
        route: "/webhooks/roller/booking",
        bookingId: "booking-1",
        reason: "loyalty_enrollment_not_allowed"
      })
    );

    consoleInfo.mockRestore();
  });

  it("POST /webhooks/roller/booking syncs follow-up contact details when customer already exists", async () => {
    const db = createDb((text) => {
      if (text.includes("from customers")) {
        return createResult([{ id: "existing-customer-id" }], 1);
      }

      if (text.includes("returning id")) {
        return createResult([{ id: "existing-customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/roller/booking").send({
      ...rollerBookingWebhookPayload,
      data: {
        ...rollerBookingWebhookPayload.data,
        customerFlags: []
      }
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(8);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[1].params).toEqual(["user@example.com"]);
    expect(db.calls[2].params).toEqual(["+358401234567"]);
    expect(db.calls[6].params).toEqual([
      "existing-customer-id",
      "user@example.com",
      "+358401234567",
      "Taylor Example",
      null,
      "123456",
      null,
      null
    ]);
  });

  it("POST /webhooks/roller/booking logs a processed event after persistence", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({ db });
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    const response = await request(app).post("/webhooks/roller/booking").send(rollerBookingWebhookPayload);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "roller_booking_processed",
        route: "/webhooks/roller/booking",
        bookingId: "booking-1",
        customerId: "customer-id"
      })
    );

    consoleInfo.mockRestore();
  });

  it("POST /webhooks/roller/signed-waiver records the webhook and updates customer waiver status", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/roller/signed-waiver").send(rollerSignedWaiverWebhookPayload);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(5);
    expect(db.calls[0].params?.[0]).toBe("roller.signed_waiver");
    expect(db.calls[1].params).toEqual(["user@example.com"]);
    expect(db.calls[2].params).toEqual(["+358401234567"]);
    expect(db.calls[3].params).toEqual(["user@example.com", "+358401234567", "Taylor Example", null, "64310293", null, null]);
    expect(db.calls[4].params).toEqual([
      "customer-id",
      "valid",
      "2026-05-02T09:45:00.000Z",
      "2027-05-02T09:45:00.000Z"
    ]);
  });

  it("POST /webhooks/roller/booking accepts the documented webhook envelope even when the booking payload has no email", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/roller/booking").send(existingAccountProjectionRow.bookingWithoutEmailWebhook);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
  });

  it("POST /webhooks/roller/booking updates an existing booking for cancellation without email", async () => {
    const db = createDb((text) => {
      if (text.includes("from bookings") && text.includes("where booking_id = $1")) {
        return createResult([{ customer_id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/roller/booking").send({
      ...existingAccountProjectionRow.bookingWithoutEmailWebhook,
      eventType: "Cancelled",
      data: {
        ...existingAccountProjectionRow.bookingWithoutEmailWebhook.data,
        status: "Cancelled"
      }
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[2].params).toEqual(["booking-1"]);
    expect(db.calls[3].params).toEqual([
      "booking-1",
      "customer-id",
      "booking-1",
      "123456",
      null,
      null,
      null,
      null,
      "2026-05-02",
      null,
      "2026-05-02T10:00:00.000Z",
      3,
      "Cancelled",
      "Cancelled",
      "2026-05-02T09:45:00.000Z",
      "67d2ada6-10cc-4177-909d-430f3b2593d4"
    ]);
  });

  it("POST /webhooks/roller/:parkId/booking uses path parkId when payload does not include park identity", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600 }
    });

    const response = await request(app)
      .post("/webhooks/roller/park-69210/booking")
      .send(existingAccountProjectionRow.bookingWithoutEmailWebhook);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[3].params?.[4]).toBe("park-69210");
  });

  it("POST /webhooks/roller/booking resolves guest contact with customerId when webhook omits email and phone", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "test-token",
            expires_in: 300
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            email: "user@example.com",
            contactNumber: "+358401234567",
            firstName: "Taylor",
            lastName: "Example"
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    const app = createApp({
      db,
      config: {
        nodeEnv: "development",
        otpTtlSeconds: 600,
        rollerApiBaseUrl: "https://api.roller.app",
        rollerClientId: "roller-client-id",
        rollerClientSecret: "roller-client-secret",
        rollerGuestDetailPathTemplate: "/guests/{customerId}"
      }
    });

    const response = await request(app).post("/webhooks/roller/booking").send({
      ...existingAccountProjectionRow.bookingWithoutEmailWebhook,
      data: {
        ...existingAccountProjectionRow.bookingWithoutEmailWebhook.data,
        customerFlags: ["LOYALTY_ENROLLMENT_ALLOWED"]
      }
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("https://api.roller.app/guests/123456");
    expect(db.calls.some((call) => JSON.stringify(call.params) === JSON.stringify(["user@example.com"]))).toBe(true);
    expect(db.calls.some((call) => JSON.stringify(call.params) === JSON.stringify(["+358401234567"]))).toBe(true);
    expect(
      db.calls.some(
        (call) =>
          JSON.stringify(call.params) ===
          JSON.stringify(["user@example.com", "+358401234567", "Taylor Example", null, "123456", null, null])
      )
    ).toBe(true);
    vi.unstubAllGlobals();
  });

  it("POST /webhooks/roller/booking skips guest lookup when customer exists by roller customerId", async () => {
    const db = createDb((text) => {
      if (text.includes("where roller_customer_id = $1")) {
        return createResult([{ id: "existing-customer-id" }], 1);
      }

      return createResult();
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const app = createApp({
      db,
      config: {
        nodeEnv: "development",
        otpTtlSeconds: 600,
        rollerApiBaseUrl: "https://api.roller.app",
        rollerClientId: "roller-client-id",
        rollerClientSecret: "roller-client-secret",
        rollerGuestDetailPathTemplate: "/guests/{customerId}"
      }
    });

    const response = await request(app).post("/webhooks/roller/booking").send({
      ...existingAccountProjectionRow.bookingWithoutEmailWebhook,
      data: {
        ...existingAccountProjectionRow.bookingWithoutEmailWebhook.data,
        customerFlags: []
      }
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(0);
    expect(db.calls).toHaveLength(3);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[1].params).toEqual(["123456"]);
    expect(db.calls[2].params?.[1]).toBe("existing-customer-id");
    vi.unstubAllGlobals();
  });

  it("POST /webhooks/roller/booking acknowledges invalid payloads without triggering retries", async () => {
    const db = createDb(() => createResult());
    const app = createApp({ db });
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const response = await request(app).post("/webhooks/roller/booking").send({
      type: "Booking",
      eventType: "Created",
      data: {
        bookingReference: "booking-1"
      }
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(0);
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "roller_webhook_invalid_payload",
        route: "/webhooks/roller/booking"
      })
    );

    consoleWarn.mockRestore();
  });

  it("POST /webhooks/roller/signed-waiver acknowledges invalid payloads without triggering retries", async () => {
    const db = createDb(() => createResult());
    const app = createApp({ db });
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const response = await request(app).post("/webhooks/roller/signed-waiver").send({
      type: "SignedWaiver",
      eventType: "Created",
      data: [
        {
          waiverId: 13
        }
      ]
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(0);
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "roller_webhook_invalid_payload",
        route: "/webhooks/roller/signed-waiver"
      })
    );

    consoleWarn.mockRestore();
  });

  it("POST /webhooks/roller/booking returns 500 for transient failures so ROLLER can retry", async () => {
    const db = createDb((text) => {
      if (text.includes("insert into webhook_events")) {
        throw new Error("database unavailable");
      }

      return createResult();
    });
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/roller/booking").send({
      ...existingAccountProjectionRow.bookingWebhookForFailure
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "internal_error" });
  });
});
