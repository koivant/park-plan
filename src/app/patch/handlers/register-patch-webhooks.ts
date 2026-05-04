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

      if (body.data.email) {
        const customerId = await upsertCustomer(db, {
          email: body.data.email,
          patchContactId: body.data.patchContactId
        });

        await db.query(
          `insert into loyalty_snapshots (customer_id, loyalty_points, loyalty_target, payload)
           values ($1, $2, $3, $4)`,
          [
            customerId,
            body.data.loyaltyPoints ?? 0,
            body.data.loyaltyTarget == null ? null : body.data.loyaltyTarget,
            body.data
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
          email: body.data.email,
          patchContactId: body.data.patchContactId
        });

        for (const code of codes) {
          await db.query(
            `insert into discount_codes (customer_id, code, status, payload)
             values ($1, $2, 'active', $3)
             on conflict (code) do update
             set customer_id = excluded.customer_id,
                 status = excluded.status,
                 payload = excluded.payload`,
            [customerId, code, body.data]
          );
        }
      }

      res.status(202).json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
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
