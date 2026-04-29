import type {
  RollerRateLimiter,
  RollerTokenProvider,
  RollerWebhookClient,
  RollerWebhookCreatePayload,
  RollerWebhookRecord
} from "./types.js";

export interface CreateAuthenticatedRollerWebhookClientOptions {
  baseUrl: string;
  tokenProvider: RollerTokenProvider;
  fetchImpl?: typeof fetch;
  rateLimiter?: RollerRateLimiter;
}

/**
 * Creates a ROLLER webhook client that:
 * - obtains OAuth access tokens through `tokenProvider`
 * - applies the shared ROLLER rate-limit gate
 * - normalizes the varying webhook response envelopes
 */
export function createAuthenticatedRollerWebhookClient(
  options: CreateAuthenticatedRollerWebhookClientOptions
): RollerWebhookClient {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async listWebhooks() {
      const payload = await requestJson({
        action: "list webhooks",
        baseUrl,
        fetchImpl,
        rateLimiter: options.rateLimiter,
        tokenProvider: options.tokenProvider,
        path: "/webhooks",
        method: "GET"
      });

      if (Array.isArray(payload)) {
        return parseWebhookRecords(payload);
      }

      if (isRecord(payload)) {
        if (Array.isArray(payload.webhooks)) {
          return payload.webhooks.filter(isRecordWithId);
        }

        if (Array.isArray(payload.data)) {
          return payload.data.filter(isRecordWithId);
        }
      }

      throw new Error("ROLLER list webhooks response did not contain a webhook array");
    },
    async createWebhook(payload) {
      const responsePayload = await requestJson({
        action: "create webhook",
        baseUrl,
        fetchImpl,
        rateLimiter: options.rateLimiter,
        tokenProvider: options.tokenProvider,
        path: "/webhooks",
        method: "POST",
        body: payload
      });

      if (isRecordWithId(responsePayload)) {
        return responsePayload;
      }

      if (isRecordWithWebhookId(responsePayload)) {
        return normalizeWebhookRecord(responsePayload);
      }

      if (isRecord(responsePayload)) {
        if (isRecordWithId(responsePayload.webhook)) {
          return responsePayload.webhook;
        }

        if (isRecordWithId(responsePayload.data)) {
          return responsePayload.data;
        }

        if (isRecordWithWebhookId(responsePayload.webhook)) {
          return normalizeWebhookRecord(responsePayload.webhook);
        }

        if (isRecordWithWebhookId(responsePayload.data)) {
          return normalizeWebhookRecord(responsePayload.data);
        }
      }

      throw new Error("ROLLER create webhook response did not contain a webhook object");
    },
    async deleteWebhook(id) {
      await request({
        action: "delete webhook",
        baseUrl,
        fetchImpl,
        rateLimiter: options.rateLimiter,
        tokenProvider: options.tokenProvider,
        path: `/webhooks/${encodeURIComponent(id)}`,
        method: "DELETE"
      });
    }
  };
}

interface RequestOptions {
  action: string;
  baseUrl: string;
  fetchImpl: typeof fetch;
  rateLimiter?: RollerRateLimiter;
  tokenProvider: RollerTokenProvider;
  path: string;
  method: string;
  body?: RollerWebhookCreatePayload;
}

/**
 * Executes a ROLLER API request and parses JSON payload.
 * Returns `unknown` because ROLLER responds with multiple envelope formats
 * depending on endpoint and API version.
 */
async function requestJson(options: RequestOptions): Promise<unknown> {
  const response = await request(options);
  return response.json();
}

/**
 * Sends one authenticated ROLLER API request.
 * On a single 401 response, invalidates the cached token and retries once.
 */
async function request(options: RequestOptions): Promise<Response> {
  let attemptedRefresh = false;

  while (true) {
    const accessToken = await options.tokenProvider.getAccessToken();
    await options.rateLimiter?.waitTurn();
    const response = await options.fetchImpl(`${options.baseUrl}${options.path}`, {
      method: options.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(options.body ? { "Content-Type": "application/json" } : {})
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    });

    if (response.status !== 401) {
      if (!response.ok) {
        throw new Error(await createHttpErrorMessage(response, options.action));
      }

      return response;
    }

    if (attemptedRefresh) {
      throw new Error(await createHttpErrorMessage(response, options.action));
    }

    attemptedRefresh = true;
    options.tokenProvider.invalidateToken();
  }
}

async function createHttpErrorMessage(response: Response, action: string): Promise<string> {
  const body = await response.text();
  return `ROLLER ${action} failed with ${response.status}${body ? `: ${body}` : ""}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRecordWithId(value: unknown): value is RollerWebhookRecord {
  return isRecord(value) && typeof value.id === "string";
}

function isRecordWithWebhookId(value: unknown): value is RollerWebhookRecord {
  return isRecord(value) && (typeof value.webhookId === "number" || typeof value.webhookId === "string");
}

function parseWebhookRecords(payload: unknown[]): RollerWebhookRecord[] {
  const records: RollerWebhookRecord[] = [];

  for (const item of payload) {
    if (isRecordWithId(item)) {
      records.push(item);
      continue;
    }

    if (!isRecordWithWebhookId(item)) {
      continue;
    }

    const normalized = normalizeWebhookRecord(item);
    const webhooks = normalized.configuration?.webhooks;
    const webhookTypes = webhooks ? Object.keys(webhooks) : [];

    if (webhookTypes.length === 0) {
      records.push(normalized);
      continue;
    }

    for (const webhookType of webhookTypes) {
      const webhookEvents = webhooks?.[webhookType]?.events;
      records.push({
        ...normalized,
        type: webhookType,
        events: Array.isArray(webhookEvents) ? webhookEvents : normalized.events
      });
    }
  }

  return records;
}

function normalizeWebhookRecord(value: RollerWebhookRecord): RollerWebhookRecord {
  const configuration = isRecord(value.configuration) ? value.configuration : undefined;
  const url = configuration && typeof configuration.url === "string" ? configuration.url : undefined;
  const enabled = configuration && typeof configuration.enabled === "boolean" ? configuration.enabled : undefined;

  return {
    ...value,
    id: String(value.webhookId),
    url,
    enabled,
    configuration: configuration as RollerWebhookRecord["configuration"]
  };
}
