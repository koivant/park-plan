import { config } from "../config.js";
import { createRollerTokenProvider } from "../roller/oauth-client.js";
import { createRollerRateLimiter } from "../roller/rate-limiter.js";
import { createAuthenticatedRollerWebhookClient } from "../roller/webhook-client.js";
import { createManagedRollerWebhooks, syncRollerWebhooks } from "../roller/webhook-installer.js";

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

  if (!config.loyaltyAppBaseUrl) {
    throw new Error("LOYALTY_APP_BASE_URL is required");
  }

  if (!config.rollerWebhookAuthApiKey) {
    throw new Error("ROLLER_WEBHOOK_AUTH_API_KEY or ROLLER_WEBHOOK_API_KEY is required");
  }

  const rateLimiter = createRollerRateLimiter();
  const tokenProvider = createRollerTokenProvider({
    baseUrl: config.rollerApiBaseUrl,
    clientId: config.rollerClientId,
    clientSecret: config.rollerClientSecret,
    rateLimiter
  });
  const client = createAuthenticatedRollerWebhookClient({
    baseUrl: config.rollerApiBaseUrl,
    tokenProvider,
    rateLimiter
  });

  const result = await syncRollerWebhooks({
    client,
    desiredWebhooks: createManagedRollerWebhooks(config.loyaltyAppBaseUrl, config.rollerWebhookAuthApiKey)
  });

  console.info({
    type: "roller_webhook_sync",
    ...result
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
