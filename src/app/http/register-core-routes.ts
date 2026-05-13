import type express from "express";
import { createOpenApiDocument } from "../openapi.js";
import { accountQuerySchema, joinSubmissionSchema, otpRequestBodySchema, otpVerifyBodySchema } from "../schema/core.js";
import { readAccountState } from "../services/account-store.js";
import { findCustomerIdByEmail, findCustomerIdByPhone, setCustomerPendingStatus, upsertCustomer } from "../services/customer-store.js";
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

  app.get("/join", (_req, res) => {
    res.type("html").send(createJoinFormHtml());
  });

  app.post("/join", async (req, res, next) => {
    try {
      const submission = joinSubmissionSchema.safeParse(req.body);
      if (!submission.success) {
        res.status(400).type("html").send(createJoinResultHtml("Invalid form input. Email is required."));
        return;
      }

      const existingByEmail = await findCustomerIdByEmail(db, submission.data.email);
      const existingByPhone = submission.data.phone ? await findCustomerIdByPhone(db, submission.data.phone) : undefined;

      if (existingByEmail || existingByPhone) {
        res
          .status(200)
          .type("html")
          .send(createJoinResultHtml("These contact details have already been signed up."));
        return;
      }

      const customerId = await upsertCustomer(db, {
        name: submission.data.name,
        email: submission.data.email,
        phone: submission.data.phone
      });
      await setCustomerPendingStatus(db, customerId, true);

      res.type("html").send(
        createJoinResultHtml(
          `Account created. Customer id: ${escapeHtml(customerId)}. Status: pending email verification.`
        )
      );
    } catch (error) {
      next(error);
    }
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

function createJoinFormHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Join Loyalty Demo</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; background: #f4f6f8; color: #17212b; }
    main { max-width: 640px; margin: 32px auto; background: #fff; border: 1px solid #dde3ea; border-radius: 12px; padding: 20px; }
    h1 { font-size: 1.4rem; margin: 0 0 8px; }
    p { margin: 0 0 16px; color: #45576a; }
    form { display: grid; gap: 10px; }
    label { display: grid; gap: 4px; font-size: 0.95rem; }
    input { font: inherit; padding: 10px; border: 1px solid #c5ced8; border-radius: 8px; }
    button { margin-top: 8px; font: inherit; padding: 10px 14px; border: 0; border-radius: 8px; background: #0f5bb8; color: #fff; cursor: pointer; }
  </style>
</head>
<body>
  <main>
    <h1>Join Loyalty Program</h1>
    <p>Sign up with your contact details.</p>
    <form method="post" action="/join">
      <label>Name <input name="name" type="text" autocomplete="name"></label>
      <label>Email <input name="email" type="email" required autocomplete="email"></label>
      <label>Phone <input name="phone" type="tel" autocomplete="tel"></label>
      <button type="submit">Create Account</button>
    </form>
  </main>
</body>
</html>`;
}

function createJoinResultHtml(message: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Join Result</title>
</head>
<body>
  <main>
    <p>${message}</p>
    <p><a href="/join">Back to form</a></p>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
