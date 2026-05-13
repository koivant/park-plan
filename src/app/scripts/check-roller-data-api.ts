import { config } from "../config.js";
import { createRollerTokenProvider } from "../roller/oauth-client.js";
import { createRollerRateLimiter } from "../roller/rate-limiter.js";

const DEFAULT_DATA_API_PATH = "/products";
const rawPath = process.env.ROLLER_DATA_API_HEALTH_PATH ?? DEFAULT_DATA_API_PATH;

function normalizePath(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return DEFAULT_DATA_API_PATH;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function buildUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  return `${normalizedBase}${path}`;
}

async function main(): Promise<void> {
  if (!config.rollerApiBaseUrl) {
    throw new Error("ROLLER_API_BASE_URL is required");
  }

  if (!config.rollerClientId) {
    throw new Error("ROLLER_CLIENT_ID is required");
  }

  if (!config.rollerClientSecret) {
    throw new Error("ROLLER_CLIENT_SECRET or ROLLER_API_KEY is required");
  }

  const path = normalizePath(rawPath);
  const url = buildUrl(config.rollerApiBaseUrl, path);
  const rateLimiter = createRollerRateLimiter();
  const tokenProvider = createRollerTokenProvider({
    baseUrl: config.rollerApiBaseUrl,
    clientId: config.rollerClientId,
    clientSecret: config.rollerClientSecret,
    rateLimiter
  });

  const accessToken = await tokenProvider.getAccessToken();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    }
  });

  const bodyText = await response.text();
  const bodyPreview = bodyText.slice(0, 4000);

  console.info(
    JSON.stringify(
      {
        type: "roller_data_api_check",
        action: "request_data_api_endpoint",
        baseUrl: config.rollerApiBaseUrl,
        requestPath: path,
        url,
        statusCode: response.status,
        ok: response.ok,
        bodyPreview
      },
      null,
      2
    )
  );

  if (!response.ok) {
    throw new Error(`ROLLER Data API check failed with ${response.status}`);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
