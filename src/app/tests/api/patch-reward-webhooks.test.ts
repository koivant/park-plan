import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { patchRewardCodeWebhookPayload } from "../mocks/patch.js";
import { createDb, createResult } from "../helpers/db.js";

describe("PATCH reward webhook API routes", () => {
  it("POST /webhooks/patch/reward-code accepts requests without webhook auth", async () => {
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

    const response = await request(app).post("/webhooks/patch/reward-code").send({
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
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
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

  it("POST /webhooks/patch/:location/reward-code uses location as customer home park", async () => {
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

    const response = await request(app).post("/webhooks/patch/glasgow/reward-code").send({
      ...patchRewardCodeWebhookPayload
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ ok: true });
    expect(db.calls).toHaveLength(4);
    expect(db.calls[0].params?.[0]).toBe("patch.reward_code");
    expect(db.calls[2].params).toEqual(["user@example.com", null, null, null, null, "glasgow", "glasgow"]);
    expect(db.calls[3].params?.slice(0, 2)).toEqual(["customer-id", "FREE-1"]);
  });
});
