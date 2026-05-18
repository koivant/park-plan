import { describe, expect, it } from "vitest";
import { createRollerTokenProvider } from "../../roller/oauth-client.js";
import { createRollerRateLimiter } from "../../roller/rate-limiter.js";
import { createAuthenticatedRollerWebhookClient } from "../../roller/webhook-client.js";

describe("ROLLER API rate limiter", () => {
  it("limits all ROLLER API calls to one call per second across token and webhook requests", async () => {
    let nowMs = Date.parse("2026-04-28T10:00:00.000Z");
    const sleeps: number[] = [];
    const requestTimes: number[] = [];

    const fetchImpl: typeof fetch = async (input) => {
      requestTimes.push(nowMs);

      if (String(input) === "https://api.roller.app/token") {
        return new Response(
          JSON.stringify({
            access_token: "token-1",
            expires_in: 60
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    };

    const rateLimiter = createRollerRateLimiter({
      now: () => nowMs,
      sleep: async (ms) => {
        sleeps.push(ms);
        nowMs += ms;
      }
    });
    const tokenProvider = createRollerTokenProvider({
      baseUrl: "https://api.roller.app",
      clientId: "client-id",
      clientSecret: "client-secret",
      fetchImpl,
      now: () => new Date(nowMs),
      rateLimiter
    });
    const client = createAuthenticatedRollerWebhookClient({
      baseUrl: "https://api.roller.app",
      tokenProvider,
      fetchImpl,
      rateLimiter
    });

    await expect(client.listWebhooks()).resolves.toEqual([]);

    expect(sleeps).toEqual([1000]);
    expect(requestTimes).toEqual([
      Date.parse("2026-04-28T10:00:00.000Z"),
      Date.parse("2026-04-28T10:00:01.000Z")
    ]);
  });
});
