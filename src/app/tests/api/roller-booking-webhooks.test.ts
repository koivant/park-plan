import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { existingAccountProjectionRow, rollerBookingWebhookPayload } from "../mocks/roller.js";
import { createDb, createResult } from "../helpers/db.js";

describe("ROLLER booking webhook API routes", () => {
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
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[1].params).toEqual(["123456"]);
    expect(db.calls[2].params).toEqual(["booking-1"]);
    expect(db.calls[3].params).toEqual([
      "booking-1",
      null,
      "booking-1",
      "123456",
      "69184",
      null,
      "VenueManager",
      "VenueManager",
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
    expect(db.calls).toHaveLength(4);
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
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
  });

  it("POST /webhooks/roller/booking skips contact sync when no contact data can be resolved", async () => {
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
    expect(db.calls[1].params).toEqual(["123456"]);
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "roller_booking_contact_sync_skipped",
        route: "/webhooks/roller/booking",
        bookingId: "booking-1",
        reason: "no_email_and_unknown_booking"
      })
    );

    consoleInfo.mockRestore();
  });

  it("POST /webhooks/roller/booking links booking to existing customer by roller customer id", async () => {
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
    expect(db.calls).toHaveLength(3);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[1].params).toEqual(["123456"]);
    expect(db.calls[2].params?.[1]).toBe("existing-customer-id");
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
        customerId: null
      })
    );

    consoleInfo.mockRestore();
  });

  it("POST /webhooks/roller/booking accepts the documented webhook envelope even when the booking payload has no email", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/webhooks/roller/booking").send(existingAccountProjectionRow.bookingWithoutEmailWebhook);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("roller.booking");
    expect(db.calls[3].params?.[4]).toBe(null);
    expect(db.calls[3].params?.[5]).toBe(null);
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
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
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
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app)
      .post("/webhooks/roller/park-69210/booking")
      .send(existingAccountProjectionRow.bookingWithoutEmailWebhook);

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[3].params?.[4]).toBe("park-69210");
    expect(db.calls[3].params?.[5]).toBe(null);
  });
});
