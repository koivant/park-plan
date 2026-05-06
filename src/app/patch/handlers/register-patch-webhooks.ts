import type express from "express";
import type { Queryable } from "../../types/database.js";
import { patchContactUpdatedBodySchema, patchRewardCodeBodySchema } from "../schema/webhooks.js";
import { extractPatchRewardCodes } from "../utils/reward-codes.js";
import { recordWebhook, upsertCustomer } from "../../services/customer-store.js";

interface RegisterPatchWebhookRoutesOptions {
  app: express.Application;
  db: Queryable;
  patchWebhookAuthApiKey?: string;
}

/** Registers inbound PATCH webhook endpoints. */
export function registerPatchWebhookRoutes(options: RegisterPatchWebhookRoutesOptions): void {
  const { app, db, patchWebhookAuthApiKey } = options;

  app.post("/webhooks/patch/contact-updated", async (req, res, next) => {
    try {
      if (!isAuthorizedPatchWebhookRequest(req, patchWebhookAuthApiKey)) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const body = patchContactUpdatedBodySchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: "invalid_payload" });
        return;
      }

      await recordWebhook(db, "patch.contact_updated", body.data);

      if (body.data.email || body.data.phone) {
        const homePark = extractHomePark(body.data);
        const loyaltyPoints = extractLoyaltyPoints(body.data);
        const customerId = await upsertCustomer(db, {
          email: body.data.email,
          phone: body.data.phone,
          patchContactId: body.data.patchContactId,
          homeParkId: homePark.homeParkId,
          homeParkName: homePark.homeParkName
        });

        await db.query(
          `update customers
           set loyalty_points = $2,
               loyalty_target = $3,
               updated_at = now()
           where id = $1`,
          [
            customerId,
            loyaltyPoints ?? 0,
            body.data.loyaltyTarget == null ? null : body.data.loyaltyTarget
          ]
        );
      }

      res.status(202).json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/webhooks/patch/reward-code", async (req, res, next) => {
    try {
      if (!isAuthorizedPatchWebhookRequest(req, patchWebhookAuthApiKey)) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const body = patchRewardCodeBodySchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: "invalid_payload" });
        return;
      }

      await recordWebhook(db, "patch.reward_code", body.data);
      const codes = extractPatchRewardCodes(body.data);

      if (body.data.email && codes.length > 0) {
        const customerId = await upsertCustomer(db, {
          email: body.data.email
        });

        for (const code of codes) {
          await db.query(
            `insert into discount_codes (customer_id, code, is_used, used_at)
             values ($1, $2, false, null)
             on conflict (code) do update
             set customer_id = excluded.customer_id,
                 is_used = excluded.is_used,
                 used_at = excluded.used_at`,
            [customerId, code]
          );
        }
      }

      res.status(202).json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
}

function extractHomePark(payload: Record<string, unknown>): { homeParkId?: string; homeParkName?: string } {
  const homeParkId = readFirstString(payload, [
    "homeParkId",
    "home_park_id",
    "closestParkId",
    "closest_park_id",
    "defaultParkId",
    "default_park_id"
  ]);

  const homeParkName = readFirstString(payload, [
    "homeParkName",
    "home_park_name",
    "homePark",
    "home_park",
    "closestPark",
    "closest_park"
  ]);

  return {
    homeParkId,
    homeParkName
  };
}

function extractLoyaltyPoints(payload: Record<string, unknown>): number | undefined {
  const direct = payload.loyaltyPoints;
  if (typeof direct === "number" && Number.isFinite(direct)) {
    return Math.trunc(direct);
  }
  if (typeof direct === "string") {
    const parsed = Number.parseInt(direct, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const punchcard = payload.punchcard;
  if (typeof punchcard === "number" && Number.isFinite(punchcard)) {
    return Math.trunc(punchcard);
  }
  if (typeof punchcard === "string") {
    const parsed = Number.parseInt(punchcard, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function readFirstString(payload: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function isAuthorizedPatchWebhookRequest(req: express.Request, expectedApiKey: string | undefined): boolean {
  if (!expectedApiKey) {
    return true;
  }

  const xApiKey = req.header("x-api-key");
  if (typeof xApiKey === "string" && xApiKey === expectedApiKey) {
    return true;
  }

  const patchApiKey = req.header("x-patch-webhook-api-key");
  if (typeof patchApiKey === "string" && patchApiKey === expectedApiKey) {
    return true;
  }

  const authorization = req.header("authorization");
  if (typeof authorization === "string") {
    const bearerPrefix = "bearer ";
    if (authorization.toLowerCase().startsWith(bearerPrefix)) {
      return authorization.slice(bearerPrefix.length).trim() === expectedApiKey;
    }

    return authorization.trim() === expectedApiKey;
  }

  return false;
}
