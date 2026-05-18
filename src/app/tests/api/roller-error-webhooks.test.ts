import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { existingAccountProjectionRow } from "../mocks/roller.js";
import { createDb, createResult } from "../helpers/db.js";

describe("ROLLER webhook error handling API routes", () => {
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
