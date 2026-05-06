import { config } from "./config.js";
import { db } from "./db.js";

async function tick(): Promise<void> {
  const activeCodes = await db.query<{ count: string }>(
    "select count(*)::text as count from discount_codes where is_used = false"
  );

  console.log({
    job: "discount-code-status-check",
    activeCodes: Number(activeCodes.rows[0]?.count ?? 0),
    patchApiBaseUrl: config.patchApiBaseUrl,
    rollerApiBaseUrl: config.rollerApiBaseUrl
  });
}

void tick();

setInterval(() => {
  void tick().catch((error) => {
    console.error("Scheduler tick failed", error);
  });
}, config.schedulerIntervalMs);
