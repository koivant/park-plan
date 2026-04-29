import crypto from "node:crypto";

/** Hashes a one-time password before persistence. */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
