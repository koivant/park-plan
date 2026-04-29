import type { RollerAccessToken, RollerRateLimiter, RollerTokenProvider } from "./types.js";

export interface CreateRollerTokenProviderOptions {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
  rateLimiter?: RollerRateLimiter;
}

export function createRollerTokenProvider(options: CreateRollerTokenProviderOptions): RollerTokenProvider {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? (() => new Date());
  const rateLimiter = options.rateLimiter;
  let currentToken: RollerAccessToken | null = null;

  return {
    async getAccessToken() {
      if (currentToken && currentToken.expiresAt > now().getTime()) {
        logTokenDebug("reuse_cached_access_token", {
          expiresAt: new Date(currentToken.expiresAt).toISOString()
        });
        return currentToken.accessToken;
      }

      logTokenDebug("request_access_token_wait_for_rate_limiter");
      await rateLimiter?.waitTurn();
      const tokenUrl = createTokenUrl(options.baseUrl);
      const requestPayload = {
        grant_type: "client_credentials",
        client_id: options.clientId,
        client_secret: options.clientSecret
      };
      logTokenDebug("request_access_token_start", {
        tokenUrl,
        payload: {
          ...requestPayload,
          client_secret: "[REDACTED]"
        },
        payloadMeta: {
          clientSecretLength: options.clientSecret.length
        }
      });

      const response = await fetchImpl(tokenUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });
      logTokenDebug("request_access_token_response", {
        statusCode: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const responseBody = await response.clone().text();
        logTokenDebug("request_access_token_failed", {
          statusCode: response.status,
          responseBody
        });
        throw new Error(await createHttpErrorMessage(response, "request access token"));
      }

      const payload = await response.json();
      if (!isRecord(payload) || typeof payload.access_token !== "string") {
        logTokenDebug("request_access_token_invalid_payload", { payload });
        throw new Error("ROLLER token response did not contain access_token");
      }

      const expiresInSeconds = getExpiresInSeconds(payload.expires_in);
      currentToken = {
        accessToken: payload.access_token,
        expiresAt: now().getTime() + expiresInSeconds * 1000
      };
      logTokenDebug("access_token_created", {
        expiresInSeconds,
        expiresAt: new Date(currentToken.expiresAt).toISOString()
      });

      return currentToken.accessToken;
    },
    invalidateToken() {
      logTokenDebug("invalidate_cached_access_token");
      currentToken = null;
    }
  };
}

function createTokenUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/token`;
}

function getExpiresInSeconds(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 300;
}

async function createHttpErrorMessage(response: Response, action: string): Promise<string> {
  const body = await response.text();
  return `ROLLER ${action} failed with ${response.status}${body ? `: ${body}` : ""}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function logTokenDebug(step: string, details: Record<string, unknown> = {}): void {
  console.info({
    type: "roller_oauth_debug",
    step,
    ...details
  });
}
