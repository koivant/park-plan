import { httpConfig } from "./config.js";
import { createOpenApiDocument } from "../openapi.js";
import { accountQuerySchema, joinSubmissionSchema, magicLinkConsumeQuerySchema, magicLinkRequestBodySchema } from "../schema/core.js";
import { readAccountState, readAccountStateByCustomerId } from "../services/account-store.js";
import { findCustomerIdByEmail, findCustomerIdByPhone, setCustomerPendingStatus, upsertCustomer } from "../services/customer-store.js";
import { hashToken } from "../utils/crypto.js";
import { createDocsHtml } from "../utils/docs.js";
import type { RegisterCoreRoutesOptions } from "./types/core-routes.js";
import { clearSessionCookie, readCookie, setSessionCookie } from "./utils/cookies.js";
import {
  createAccountViewHtml,
  createJoinFormHtml,
  createJoinResultHtml,
  createLoginFormHtml,
  createLoginResultHtml,
  createMockHomeParkHtml
} from "./utils/core-pages.js";
import { createMockHomeParkRedirect } from "./utils/home-park.js";
import { createMagicLinkUrl, logMockEmail } from "./utils/magic-link.js";
import { wantsHtml } from "./utils/request.js";
import { escapeHtml } from "./utils/html.js";

/** Registers non-integration HTTP routes such as docs, health, auth, and account. */
export function registerCoreRoutes(options: RegisterCoreRoutesOptions): void {
  const { app, db, config, now, randomMagicToken, randomUUID } = options;
  const sessions = new Map<string, string>();

  app.get(httpConfig.routes.root, (_req, res) => {
    res.redirect(httpConfig.routes.login);
  });

  app.get(httpConfig.routes.openApiJson, (_req, res) => {
    res.json(createOpenApiDocument());
  });

  app.get(httpConfig.routes.docs, (_req, res) => {
    res.type("html").send(createDocsHtml(httpConfig.routes.openApiJson));
  });

  app.get(httpConfig.routes.join, (_req, res) => {
    res.type("html").send(createJoinFormHtml());
  });

  app.get(httpConfig.routes.login, (_req, res) => {
    res.type("html").send(createLoginFormHtml());
  });

  app.post(httpConfig.routes.join, async (req, res, next) => {
    try {
      const submission = joinSubmissionSchema.safeParse(req.body);
      if (!submission.success) {
        res.status(400).type("html").send(createJoinResultHtml(httpConfig.messages.invalidJoinInput));
        return;
      }

      const existingByEmail = await findCustomerIdByEmail(db, submission.data.email);
      const existingByPhone = submission.data.phone ? await findCustomerIdByPhone(db, submission.data.phone) : undefined;

      if (existingByEmail || existingByPhone) {
        res
          .status(200)
          .type("html")
          .send(createJoinResultHtml(httpConfig.messages.duplicateSignup));
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
          `Account created. Customer id: ${escapeHtml(customerId)}. Status: ${httpConfig.messages.pendingEmailVerification}.`
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get(httpConfig.routes.health, async (_req, res, next) => {
    try {
      const result = await db.query<{ now: Date }>("select now()");
      res.json({ ok: true, databaseTime: result.rows[0]?.now });
    } catch (error) {
      next(error);
    }
  });

  app.post(httpConfig.routes.magicLinkRequest, async (req, res, next) => {
    try {
      const body = magicLinkRequestBodySchema.safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: httpConfig.errors.emailRequired });
        return;
      }

      const response = {
        ok: true,
        message: httpConfig.messages.accountMaybeSent
      };
      const customerId = await findCustomerIdByEmail(db, body.data.email);
      if (!customerId) {
        if (wantsHtml(req)) {
          res.type("html").send(createLoginResultHtml(response.message));
          return;
        }

        res.json(response);
        return;
      }

      const token = randomMagicToken();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(now().getTime() + (config.magicLinkTtlSeconds ?? httpConfig.magicLink.ttlSeconds) * 1000);

      await db.query(
        `insert into magic_link_tokens (customer_id, token_hash, expires_at)
         values ($1, $2, $3)`,
        [customerId, tokenHash, expiresAt]
      );

      const magicLink = createMagicLinkUrl(config.loyaltyAppBaseUrl, token);
      logMockEmail(body.data.email, magicLink);

      if (wantsHtml(req)) {
        res.type("html").send(createLoginResultHtml(httpConfig.messages.checkDockerLogs));
        return;
      }

      res.json({
        ...response,
        demoMagicLink: config.nodeEnv === "development" ? magicLink : undefined
      });
    } catch (error) {
      next(error);
    }
  });

  app.get(httpConfig.routes.magicLinkConsume, async (req, res, next) => {
    try {
      const query = magicLinkConsumeQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(400).json({ error: httpConfig.errors.tokenRequired });
        return;
      }

      const tokenHash = hashToken(query.data.token);
      const result = await db.query<{ id: string; customer_id: string }>(
        `update magic_link_tokens
         set consumed_at = now()
         where id = (
           select id from magic_link_tokens
           where token_hash = $1
             and consumed_at is null
             and expires_at > now()
           order by created_at desc
           limit 1
         )
         returning id, customer_id`,
        [tokenHash]
      );

      if (result.rowCount === 0) {
        res.status(401).json({ error: httpConfig.errors.invalidMagicLink });
        return;
      }

      const sessionToken = randomUUID();
      const customerId = result.rows[0]?.customer_id;
      if (customerId) {
        sessions.set(sessionToken, customerId);
      }

      setSessionCookie(res, sessionToken);

      if (wantsHtml(req)) {
        res.redirect(httpConfig.routes.accountView);
        return;
      }

      res.json({ ok: true, sessionToken });
    } catch (error) {
      next(error);
    }
  });

  app.get(httpConfig.routes.accountView, async (req, res, next) => {
    try {
      const sessionToken = readCookie(req, httpConfig.cookies.sessionName);
      const customerId = sessionToken ? sessions.get(sessionToken) : undefined;
      if (!sessionToken || !customerId) {
        clearSessionCookie(res);
        res.redirect(httpConfig.routes.login);
        return;
      }

      const account = await readAccountStateByCustomerId(db, customerId);
      if (!account) {
        sessions.delete(sessionToken);
        clearSessionCookie(res);
        res.redirect(httpConfig.routes.login);
        return;
      }

      res.type("html").send(createAccountViewHtml(account));
    } catch (error) {
      next(error);
    }
  });

  app.post(httpConfig.routes.logout, async (req, res, next) => {
    try {
      const sessionToken = readCookie(req, httpConfig.cookies.sessionName);
      const customerId = sessionToken ? sessions.get(sessionToken) : undefined;
      const account = customerId ? await readAccountStateByCustomerId(db, customerId) : undefined;

      if (sessionToken) {
        sessions.delete(sessionToken);
      }

      clearSessionCookie(res);
      res.redirect(createMockHomeParkRedirect(account));
    } catch (error) {
      next(error);
    }
  });

  app.get(httpConfig.routes.mockHomePark, (req, res) => {
    const parkName = typeof req.query.parkName === "string" && req.query.parkName ? req.query.parkName : httpConfig.defaults.mockHomeParkName;
    res.type("html").send(createMockHomeParkHtml(parkName));
  });

  app.get(httpConfig.routes.account, async (req, res, next) => {
    try {
      const query = accountQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(400).json({ error: httpConfig.errors.emailRequired });
        return;
      }

      res.json(await readAccountState(db, query.data.email));
    } catch (error) {
      next(error);
    }
  });
}
