import { config } from "../config.js";
import { createRollerTokenProvider } from "../roller/oauth-client.js";
import { createRollerRateLimiter } from "../roller/rate-limiter.js";
import { createAuthenticatedRollerWebhookClient } from "../roller/webhook-client.js";
import { getActiveRollerWebhookDetails } from "../roller/webhook-inspector.js";

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

  const webhooks = await client.listWebhooks();
  const activeWebhooks = getActiveRollerWebhookDetails(webhooks);

  console.info(
    JSON.stringify(
      {
        type: "roller_webhooks_check",
        totalWebhooks: webhooks.length,
        activeWebhookCount: activeWebhooks.length,
        activeWebhooks
      },
      null,
      2
    )
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
