import crypto from "node:crypto";
import express from "express";
import { config as defaultConfig } from "./config.js";
import { db as defaultDb } from "./db.js";
import { registerCoreRoutes } from "./http/register-core-routes.js";
import { registerPatchWebhookRoutes } from "./patch/handlers/register-patch-webhooks.js";
import { registerRollerWebhookRoutes } from "./roller/handlers/register-roller-webhooks.js";
import type { CreateAppOptions } from "./types/app.js";
export type { Queryable } from "./types/database.js";
import { errorHandler, createRequestLoggingMiddleware } from "./utils/http.js";

export function createApp(options: CreateAppOptions = {}): express.Application {
  const app = express();
  const db = options.db ?? defaultDb;
  const config = options.config ?? defaultConfig;
  const now = options.now ?? (() => new Date());
  const randomOtp = options.randomOtp ?? (() => String(crypto.randomInt(100000, 999999)));
  const randomUUID = options.randomUUID ?? (() => crypto.randomUUID());

  app.use(express.json({ limit: "1mb" }));
  app.use(createRequestLoggingMiddleware());

  registerCoreRoutes({ app, db, config, now, randomOtp, randomUUID });
  registerPatchWebhookRoutes({ app, db, patchWebhookAuthApiKey: config.patchWebhookAuthApiKey });
  registerRollerWebhookRoutes({ app, db, now });
  app.use(errorHandler);

  return app;
}
