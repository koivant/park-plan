import type { RollerRateLimiter, RollerTokenProvider } from "./types.js";

export interface RollerGuestClient {
  getGuestDetail(customerId: string): Promise<unknown>;
}

export interface CreateAuthenticatedRollerGuestClientOptions {
  baseUrl: string;
  tokenProvider: RollerTokenProvider;
  guestDetailPathTemplate?: string;
  fetchImpl?: typeof fetch;
  rateLimiter?: RollerRateLimiter;
}

/** Creates a ROLLER client for looking up guest contact details by customer id. */
export function createAuthenticatedRollerGuestClient(options: CreateAuthenticatedRollerGuestClientOptions): RollerGuestClient {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;
  const guestDetailPathTemplate = normalizeGuestDetailPathTemplate(options.guestDetailPathTemplate);

  return {
    async getGuestDetail(customerId: string) {
      const path = guestDetailPathTemplate.replace("{customerId}", encodeURIComponent(customerId));
      const response = await request({
        action: "get guest detail",
        baseUrl,
        fetchImpl,
        rateLimiter: options.rateLimiter,
        tokenProvider: options.tokenProvider,
        path,
        method: "GET"
      });

      return response.json();
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
}

/** Sends one authenticated ROLLER API request and retries once on 401. */
async function request(options: RequestOptions): Promise<Response> {
  let attemptedRefresh = false;

  while (true) {
    const accessToken = await options.tokenProvider.getAccessToken();
    await options.rateLimiter?.waitTurn();
    const response = await options.fetchImpl(`${options.baseUrl}${options.path}`, {
      method: options.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
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

function normalizeGuestDetailPathTemplate(value: string | undefined): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "/guests/{customerId}";
  }

  const normalized = value.trim();
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

async function createHttpErrorMessage(response: Response, action: string): Promise<string> {
  const body = await response.text();
  return `ROLLER ${action} failed with ${response.status}${body ? `: ${body}` : ""}`;
}
