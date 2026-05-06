import type { PatchRewardCodeSource } from "../types/webhooks.js";

/** Extracts all reward codes from a PATCH reward-code webhook payload. */
export function extractPatchRewardCodes(payload: PatchRewardCodeSource): string[] {
  const code = payload.discount_code;
  if (typeof code === "string" || typeof code === "number" || typeof code === "bigint") {
    return [String(code)];
  }

  return [];
}
