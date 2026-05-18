import crypto from "node:crypto";
import express from "express";
import { config as defaultConfig } from "./config.js";
import { db as defaultDb } from "./db.js";
import { registerCoreRoutes } from "./http/register-core-routes.js";
import { registerPatchWebhookRoutes } from "./patch/handlers/register-patch-webhooks.js";
import { createAuthenticatedRollerGuestClient } from "./roller/guest-client.js";
import { registerRollerWebhookRoutes } from "./roller/handlers/register-roller-webhooks.js";
import { createRollerTokenProvider } from "./roller/oauth-client.js";
import { createRollerRateLimiter } from "./roller/rate-limiter.js";
import type { CreateAppOptions } from "./types/app.js";
export type { Queryable } from "./types/database.js";
import { errorHandler, createRequestLoggingMiddleware } from "./utils/http.js";

export function createApp(options: CreateAppOptions = {}): express.Application {
  const app = express();
  const db = options.db ?? defaultDb;
  const config = options.config ?? defaultConfig;
  const now = options.now ?? (() => new Date());
  const randomMagicToken = options.randomMagicToken ?? (() => crypto.randomBytes(32).toString("base64url"));
  const randomUUID = options.randomUUID ?? (() => crypto.randomUUID());

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));
  app.use(createRequestLoggingMiddleware());

  registerCoreRoutes({ app, db, config, now, randomMagicToken, randomUUID });
  registerPatchWebhookRoutes({ app, db });
  const rollerGuestLookup =
    config.rollerApiBaseUrl && config.rollerClientId && config.rollerClientSecret
      ? createAuthenticatedRollerGuestClient({
          baseUrl: config.rollerApiBaseUrl,
          tokenProvider: createRollerTokenProvider({
            baseUrl: config.rollerApiBaseUrl,
            clientId: config.rollerClientId,
            clientSecret: config.rollerClientSecret,
            rateLimiter: createRollerRateLimiter()
          }),
          guestDetailPathTemplate: config.rollerGuestDetailPathTemplate
        })
      : undefined;
  registerRollerWebhookRoutes({ app, db, now, rollerGuestLookup });
  app.use(errorHandler);

  return app;
}
