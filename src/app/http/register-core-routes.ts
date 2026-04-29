import type express from "express";
import { createOpenApiDocument } from "../openapi.js";
import { accountQuerySchema, otpRequestBodySchema, otpVerifyBodySchema } from "../schema/core.js";
import { readAccountState } from "../services/account-store.js";
import type { AppDependencies } from "../types/app.js";
import { createDocsHtml } from "../utils/docs.js";
import { hashOtp } from "../utils/crypto.js";

interface RegisterCoreRoutesOptions extends AppDependencies {
  app: express.Application;
}

/** Registers non-integration HTTP routes such as docs, health, auth, and account. */
export function registerCoreRoutes(options: RegisterCoreRoutesOptions): void {
  const { app, db, config, now, randomOtp, randomUUID } = options;

  app.get("/openapi/openapi.json", (_req, res) => {
    res.json(createOpenApiDocument());
  });

  app.get("/docs", (_req, res) => {
    res.type("html").send(createDocsHtml("/openapi/openapi.json"));
  });

  app.get("/health", async (_req, res, next) => {
    try {
      const result = await db.query<{ now: Date }>("select now()");
      res.json({ ok: true, databaseTime: result.rows[0]?.now });
    } catch (error) {
      next(error);
    }
  });

  app.post("/auth/otp/request", async (req, res, next) => {
    try {
      const body = otpRequestBodySchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: "email_required" });
        return;
      }

      const otp = randomOtp();
      const otpHash = hashOtp(otp);
      const expiresAt = new Date(now().getTime() + config.otpTtlSeconds * 1000);

      await db.query(
        `insert into otp_codes (email, otp_hash, expires_at)
         values ($1, $2, $3)`,
        [body.data.email, otpHash, expiresAt]
      );

      res.json({
        ok: true,
        message: "OTP created for demo environment",
        demoOtp: config.nodeEnv === "development" ? otp : undefined
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/auth/otp/verify", async (req, res, next) => {
    try {
      const body = otpVerifyBodySchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: "email_and_otp_required" });
        return;
      }

      const otpHash = hashOtp(body.data.otp);
      const result = await db.query<{ id: string }>(
        `update otp_codes
         set consumed_at = now()
         where id = (
           select id from otp_codes
           where email = $1
             and otp_hash = $2
             and consumed_at is null
             and expires_at > now()
           order by created_at desc
           limit 1
         )
         returning id`,
        [body.data.email, otpHash]
      );

      if (result.rowCount === 0) {
        res.status(401).json({ error: "invalid_otp" });
        return;
      }

      res.json({ ok: true, sessionToken: randomUUID() });
    } catch (error) {
      next(error);
    }
  });

  app.get("/account", async (req, res, next) => {
    try {
      const query = accountQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(400).json({ error: "email_required" });
        return;
      }

      res.json(await readAccountState(db, query.data.email));
    } catch (error) {
      next(error);
    }
  });
}
