import "dotenv/config";

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  apiPort: Number(process.env.API_PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? "postgres://loyalty:loyalty@localhost:5432/loyalty",
  otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS ?? 600),
  schedulerIntervalMs: Number(process.env.SCHEDULER_INTERVAL_MS ?? 300_000),
  patchApiBaseUrl: process.env.PATCH_API_BASE_URL ?? "",
  patchApiKey: process.env.PATCH_API_KEY ?? "",
  patchApiAccountId: process.env.PATCH_API_ACCOUNT_ID ?? "",
  rollerApiBaseUrl: process.env.ROLLER_API_BASE_URL ?? "",
  rollerClientId: process.env.ROLLER_CLIENT_ID ?? "",
  rollerClientSecret: process.env.ROLLER_CLIENT_SECRET ?? process.env.ROLLER_API_KEY ?? "",
  rollerGuestDetailPathTemplate: process.env.ROLLER_GUEST_DETAIL_PATH_TEMPLATE ?? "/guests/{customerId}",
  rollerBookingWebhookPath: "/webhooks/roller/booking",
  rollerWebhookAuthApiKey:
    process.env.ROLLER_WEBHOOK_AUTH_API_KEY ?? process.env.ROLLER_WEBHOOK_API_KEY ?? process.env.ROLLER_CLIENT_SECRET ?? process.env.ROLLER_API_KEY ?? "",
  loyaltyAppBaseUrl: process.env.LOYALTY_APP_BASE_URL ?? ""
};
