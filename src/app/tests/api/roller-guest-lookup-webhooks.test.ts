import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { existingAccountProjectionRow } from "../mocks/roller.js";
import { createDb, createResult } from "../helpers/db.js";

describe("ROLLER booking guest lookup webhook routes", () => {
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
        magicLinkTtlSeconds: 600,
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
        magicLinkTtlSeconds: 600,
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
});
