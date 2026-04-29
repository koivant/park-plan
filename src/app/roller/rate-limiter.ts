import type { RollerRateLimiter } from "./types.js";

export interface CreateRollerRateLimiterOptions {
  intervalMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

export function createRollerRateLimiter(options: CreateRollerRateLimiterOptions = {}): RollerRateLimiter {
  const intervalMs = options.intervalMs ?? 1000;
  const now = options.now ?? (() => Date.now());
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  let nextAllowedAt = 0;
  let queue = Promise.resolve();

  return {
    async waitTurn() {
      const current = queue;
      let release!: () => void;
      queue = new Promise<void>((resolve) => {
        release = resolve;
      });

      await current;

      const currentTime = now();
      const waitMs = Math.max(0, nextAllowedAt - currentTime);
      if (waitMs > 0) {
        await sleep(waitMs);
      }

      nextAllowedAt = Math.max(now(), nextAllowedAt) + intervalMs;
      release();
    }
  };
}
