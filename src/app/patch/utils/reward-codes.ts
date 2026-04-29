import type { PatchRewardCodeSource } from "../types/webhooks.js";

/** Extracts all reward codes from a PATCH reward-code webhook payload. */
export function extractPatchRewardCodes(payload: PatchRewardCodeSource): string[] {
  const codes = Array.isArray(payload.codes) ? payload.codes : [payload.code].filter((code) => code != null);
  return codes
    .filter((code): code is string | number | bigint => typeof code === "string" || typeof code === "number" || typeof code === "bigint")
    .map((code) => String(code));
}
