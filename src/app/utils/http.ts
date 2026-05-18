import type express from "express";

const endpointActions: Record<string, string> = {
  "GET /openapi/openapi.json": "Return the OpenAPI specification document",
  "GET /docs": "Serve interactive API documentation",
  "GET /health": "Check API and database health status",
  "GET /login": "Serve local magic-link login page",
  "POST /auth/magic-link/request": "Create a one-time magic link for authentication",
  "GET /auth/magic-link": "Consume magic link and issue a session token",
  "GET /account-view": "Serve local customer account view",
  "POST /logout": "Log out local web session",
  "GET /mock/home-park": "Serve mock home park front page",
  "GET /account": "Read the customer account projection",
  "POST /webhooks/patch/contact-updated": "Ingest PATCH contact update webhook",
  "POST /webhooks/patch/reward-code": "Ingest PATCH reward-code webhook",
  "POST /webhooks/roller/booking": "Ingest ROLLER booking webhook",
  "POST /webhooks/roller/signed-waiver": "Ingest ROLLER signed-waiver webhook"
};

/** Logs one structured entry for every completed HTTP request. */
export function createRequestLoggingMiddleware(): express.RequestHandler {
  return (req, res, next) => {
    const startedAt = performance.now();
    const action = endpointActions[`${req.method} ${req.path}`] ?? `Handle ${req.method} ${req.path}`;
    const payload = createPayload(req);
    const bodyJson = serializeBodyJson(req.body);
    const isWebhookRequest = req.path.startsWith("/webhooks/");

    if (isWebhookRequest) {
      console.info({
        type: "http_webhook_received",
        method: req.method,
        path: req.path,
        action,
        ...(bodyJson ? { bodyJson } : {}),
        ...(payload ? { payload } : {})
      });
    }

    res.on("finish", () => {
      console.info({
        type: "http_request",
        method: req.method,
        path: req.path,
        action,
        ...(bodyJson ? { bodyJson } : {}),
        ...(payload ? { payload } : {}),
        statusCode: res.statusCode,
        durationMs: Math.round((performance.now() - startedAt) * 100) / 100
      });
    });

    next();
  };
}

function createPayload(req: express.Request): Record<string, unknown> | undefined {
  const payload: Record<string, unknown> = {};

  if (isRecordWithKeys(req.body)) {
    payload.body = req.body;
  }

  if (isRecordWithKeys(req.query)) {
    payload.query = req.query;
  }

  if (isRecordWithKeys(req.params)) {
    payload.params = req.params;
  }

  return Object.keys(payload).length > 0 ? payload : undefined;
}

function isRecordWithKeys(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Object.keys(value).length > 0;
}

function serializeBodyJson(value: unknown): string | undefined {
  if (!isRecordWithKeys(value)) {
    return undefined;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

/** Final Express error middleware for unexpected failures. */
export function errorHandler(
  error: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void {
  console.error(error);
  res.status(500).json({ error: "internal_error" });
}
