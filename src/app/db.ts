import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const db = new Pool({
  connectionString: config.databaseUrl
});

// Prevent process-level crashes from idle-client errors (for example DB restarts / EOF).
db.on("error", (error) => {
  console.error({
    type: "database_pool_error",
    message: error.message,
    stack: error.stack
  });
});

export async function closeDb(): Promise<void> {
  await db.end();
}
