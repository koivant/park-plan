import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { rollerSignedWaiverWebhookPayload } from "../mocks/roller.js";
import { createDb, createResult } from "../helpers/db.js";

describe("ROLLER signed-waiver webhook API routes", () => {
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
    expect(db.calls).toHaveLength(6);
    expect(db.calls[0].params?.[0]).toBe("roller.signed_waiver");
    expect(db.calls[1].params).toEqual(["user@example.com"]);
    expect(db.calls[2].params).toEqual(["+358401234567"]);
    expect(db.calls[3].params).toEqual(["64310293"]);
    expect(db.calls[4].params).toEqual(["user@example.com", "+358401234567", "Taylor Example", null, "64310293", null, null]);
    expect(db.calls[5].params).toEqual([
      "customer-id",
      "valid",
      "2026-05-02T09:45:00.000Z",
      "2027-05-02T09:45:00.000Z"
    ]);
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
});
