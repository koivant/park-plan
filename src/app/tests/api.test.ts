import type { QueryResult, QueryResultRow } from "pg";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp, type Queryable } from "../app.js";
import {
  existingAccountProjectionRow,
  existingBookingProjection,
  existingSignedWaiverProjection,
  rollerBookingWebhookPayload,
  rollerSignedWaiverProfile,
  rollerSignedWaiverProjectionEntries,
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
    const app = createApp({ db });

    const response = await request(app).get("/openapi/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths["/health"]).toBeDefined();
    expect(response.headers["content-type"]).toContain("application/json");
  });

  it("GET /docs returns a browsable OpenAPI docs page", async () => {
    const db = createDb(() => createResult());
    const app = createApp({ db });

    const response = await request(app).get("/docs");

    expect(response.status).toBe(200);
    expect(response.text).toContain("SwaggerUIBundle");
    expect(response.text).toContain("/openapi/openapi.json");
    expect(response.text).toContain("<title>Loyalty Demo API Docs</title>");
    expect(response.headers["content-type"]).toContain("text/html");
  });

  it("logs request metadata for incoming REST calls", async () => {
    const db = createDb(() => createResult([{ now: new Date("2026-01-01T00:00:00.000Z") }]));
    const app = createApp({ db });
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
    const app = createApp({ db });
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
    const app = createApp({ db });

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
    const app = createApp({ db });

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
    const app = createApp({ db });

    const response = await request(app)
      .post("/auth/otp/verify")
      .send({ email: "user@example.com", otp: "123456" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "invalid_otp" });
  });

  it("GET /account returns a default account when no customer exists", async () => {
    const db = createDb(() => createResult());
    const app = createApp({ db });

    const response = await request(app).get("/account").query({ email: "USER@example.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      email: "user@example.com",
      loyalty_points: 0,
      loyalty_target: null,
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
              status: "active",
              issuedAt: "2026-05-01T09:00:00.000Z",
              usedAt: null
            }
          ]
        }
      ])
    );
    const app = createApp({ db });

    const response = await request(app).get("/account").query({ email: "user@example.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      email: "user@example.com",
      loyalty_points: 7,
      loyalty_target: 10,
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
          status: "active",
          issuedAt: "2026-05-01T09:00:00.000Z",
          usedAt: null
        }
      ]
    });
  });

  it("POST /webhooks/patch/contact-updated records the webhook and stores a loyalty snapshot", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/patch/contact-updated").send({
      ...patchContactUpdatedPayload
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(3);
    expect(db.calls[0].params?.[0]).toBe("patch.contact_updated");
    expect(db.calls[1].params).toEqual(["user@example.com", "patch-id", null]);
    expect(db.calls[2].params?.slice(0, 3)).toEqual(["customer-id", 4, 10]);
  });

  it("POST /webhooks/patch/contact-updated rejects unauthorized requests when webhook auth key is configured", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", otpTtlSeconds: 600, patchWebhookAuthApiKey: "patch-secret" }
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
      config: { nodeEnv: "development", otpTtlSeconds: 600, patchWebhookAuthApiKey: "patch-secret" }
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
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/patch/reward-code").send({
      ...patchRewardCodeWebhookPayload
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("patch.reward_code");
    expect(db.calls[1].params).toEqual(["user@example.com", "patch-id", null]);
    expect(db.calls[2].params?.slice(0, 2)).toEqual(["customer-id", "FREE-1"]);
    expect(db.calls[3].params?.slice(0, 2)).toEqual(["customer-id", "FREE-2"]);
  });

  it("POST /webhooks/roller/booking records the webhook and merges booking data into the account projection", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      if (text.includes("from account_projection")) {
        return createResult([
          {
            profile_json: { email: "user@example.com" },
            bookings_json: [existingBookingProjection],
            waivers_json: []
          }
        ]);
      }

      return createResult();
    });
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/roller/booking").send(rollerBookingWebhookPayload);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(5);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[1].params).toEqual(["user@example.com"]);
    expect(db.calls[2].params).toEqual(["user@example.com", null, "123456"]);
    expect(db.calls[4].params?.[0]).toBe("customer-id");
    expect(db.calls[4].params?.[1]).toEqual({
      email: "user@example.com",
      firstName: "Taylor",
      lastName: "Example",
      name: "Taylor Example",
      phone: "+358401234567"
    });
    expect(db.calls[4].params?.[2]).toEqual([
      {
        ...existingBookingProjection
      },
      {
        bookingId: "booking-1",
        venue: "SuperPark Vantaa",
        startsAt: "2026-05-02T10:00:00.000Z",
        ticketCount: 3,
        status: "confirmed"
      }
    ]);
  });

  it("POST /webhooks/roller/booking accepts numeric webhook type and eventType IDs", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      if (text.includes("from account_projection")) {
        return createResult([
          {
            profile_json: { email: "user@example.com" },
            bookings_json: [],
            waivers_json: []
          }
        ]);
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
    expect(db.calls).toHaveLength(5);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
  });

  it("POST /webhooks/roller/booking accepts data wrapped under data.booking", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      if (text.includes("from account_projection")) {
        return createResult([
          {
            profile_json: { email: "user@example.com" },
            bookings_json: [],
            waivers_json: []
          }
        ]);
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
    expect(db.calls).toHaveLength(5);
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
    expect(db.calls).toHaveLength(2);
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

      if (text.includes("from account_projection")) {
        return createResult([
          {
            profile_json: { email: "user@example.com", firstName: "Old" },
            bookings_json: [],
            waivers_json: []
          }
        ]);
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
    expect(db.calls).toHaveLength(5);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[1].params).toEqual(["user@example.com"]);
    expect(db.calls[2].params).toEqual(["user@example.com", null, "123456"]);
    expect(db.calls[4].params?.[0]).toBe("existing-customer-id");
    expect(db.calls[4].params?.[1]).toEqual(
      expect.objectContaining({
        email: "user@example.com",
        firstName: "Taylor",
        lastName: "Example"
      })
    );
  });

  it("POST /webhooks/roller/booking logs a processed event after persistence", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      if (text.includes("from account_projection")) {
        return createResult([
          {
            profile_json: { email: "user@example.com" },
            bookings_json: [],
            waivers_json: []
          }
        ]);
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

  it("POST /webhooks/roller/signed-waiver records the webhook and merges waiver data into the account projection", async () => {
    const db = createDb((text) => {
      if (text.includes("returning id")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      if (text.includes("from account_projection")) {
        return createResult([
          {
            profile_json: {
              email: "user@example.com",
              name: "Taylor Example"
            },
            bookings_json: [],
            waivers_json: [
              existingSignedWaiverProjection
            ]
          }
        ]);
      }

      return createResult();
    });
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/roller/signed-waiver").send(rollerSignedWaiverWebhookPayload);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("roller.signed_waiver");
    expect(db.calls[1].params).toEqual(["user@example.com", null, "64310293"]);
    expect(db.calls[3].params?.[0]).toBe("customer-id");
    expect(db.calls[3].params?.[1]).toEqual(rollerSignedWaiverProfile);
    expect(db.calls[3].params?.[3]).toEqual([
      existingSignedWaiverProjection,
      ...rollerSignedWaiverProjectionEntries
    ]);
  });

  it("POST /webhooks/roller/booking accepts the documented webhook envelope even when the booking payload has no email", async () => {
    const db = createDb(() => createResult());
    const app = createApp({ db });

    const response = await request(app).post("/webhooks/roller/booking").send(existingAccountProjectionRow.bookingWithoutEmailWebhook);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(2);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
  });

  it("POST /webhooks/roller/booking updates an existing booking for cancellation without email", async () => {
    const db = createDb((text) => {
      if (text.includes("where bookings_json @>")) {
        return createResult([{ customer_id: "customer-id" }], 1);
      }

      if (text.includes("from account_projection")) {
        return createResult([
          {
            profile_json: {
              email: "user@example.com",
              firstName: "Taylor",
              lastName: "Example"
            },
            bookings_json: [
              {
                bookingId: "booking-1",
                venue: "SuperPark Vantaa",
                startsAt: "2026-05-02T10:00:00.000Z",
                ticketCount: 3,
                status: "confirmed"
              }
            ],
            waivers_json: []
          }
        ]);
      }

      return createResult();
    });
    const app = createApp({ db });

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
    expect(db.calls[1].params).toEqual(["booking-1"]);
    expect(db.calls[3].params?.[2]).toEqual([
      {
        bookingId: "booking-1",
        venue: "SuperPark Vantaa",
        startsAt: "2026-05-02T10:00:00.000Z",
        ticketCount: 3,
        status: "Cancelled"
      }
    ]);
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
