import type express from "express";
import type { Queryable } from "../../types/database.js";
import { patchContactUpdatedBodySchema, patchRewardCodeBodySchema } from "../schema/webhooks.js";
import { extractPatchRewardCodes } from "../utils/reward-codes.js";
import { recordWebhook, upsertCustomer } from "../../services/customer-store.js";

interface RegisterPatchWebhookRoutesOptions {
  app: express.Application;
  db: Queryable;
}

/** Registers inbound PATCH webhook endpoints. */
export function registerPatchWebhookRoutes(options: RegisterPatchWebhookRoutesOptions): void {
  const { app, db } = options;

  const handleContactUpdated: express.RequestHandler = async (req, res, next) => {
    try {
      const body = patchContactUpdatedBodySchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: "invalid_payload" });
        return;
      }

      await recordWebhook(db, "patch.contact_updated", body.data);

      if (body.data.email || body.data.phone) {
        const homePark = extractHomePark(body.data, readLocationParam(req.params));
        const loyaltyPoints = extractLoyaltyPoints(body.data);
        const rollerCustomerId = extractRollerCustomerId(body.data);
        const customerId = await upsertCustomer(db, {
          email: body.data.email,
          phone: body.data.phone,
          rollerCustomerId,
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
  };

  app.post("/webhooks/patch/contact-updated", handleContactUpdated);
  app.post("/webhooks/patch/:location/contact-updated", handleContactUpdated);

  const handleRewardCode: express.RequestHandler = async (req, res, next) => {
    try {
      const body = patchRewardCodeBodySchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: "invalid_payload" });
        return;
      }

      await recordWebhook(db, "patch.reward_code", body.data);
      const codes = extractPatchRewardCodes(body.data);

      if (body.data.email && codes.length > 0) {
        const homePark = readLocationHomePark(req.params);
        const customerId = await upsertCustomer(db, {
          email: body.data.email,
          homeParkId: homePark?.homeParkId,
          homeParkName: homePark?.homeParkName
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
  };

  app.post("/webhooks/patch/reward-code", handleRewardCode);
  app.post("/webhooks/patch/:location/reward-code", handleRewardCode);
}

function extractHomePark(
  payload: Record<string, unknown>,
  location: string | undefined
): { homeParkId?: string; homeParkName?: string } {
  const locationHomePark = location ? { homeParkId: location, homeParkName: location } : undefined;
  const homeParkId =
    locationHomePark?.homeParkId ??
    readFirstString(payload, [
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
  ]) ?? locationHomePark?.homeParkName;

  return {
    homeParkId,
    homeParkName
  };
}

function readLocationHomePark(params: Record<string, unknown> | undefined): { homeParkId: string; homeParkName: string } | undefined {
  const location = readLocationParam(params);
  return location ? { homeParkId: location, homeParkName: location } : undefined;
}

function readLocationParam(params: Record<string, unknown> | undefined): string | undefined {
  if (!params) {
    return undefined;
  }

  const location = params.location;
  if (typeof location !== "string") {
    return undefined;
  }

  const trimmed = location.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : undefined;
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

function extractRollerCustomerId(payload: Record<string, unknown>): string | undefined {
  for (const key of ["roller_id", "rollerId", "customerId", "customer_id"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(Math.trunc(value));
    }
  }

  return undefined;
}
