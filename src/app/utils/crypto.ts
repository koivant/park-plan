import crypto from "node:crypto";

/** Hashes an opaque bearer token before persistence. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
