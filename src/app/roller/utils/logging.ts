/** Logs invalid ROLLER webhook payloads that should still be acknowledged. */
export function acknowledgeInvalidRollerWebhook(route: string, errors: Record<string, string[] | undefined>): void {
  console.warn({
    type: "roller_webhook_invalid_payload",
    route,
    errors
  });
}
