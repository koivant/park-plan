import { describe, expect, it, vi } from "vitest";
import { createRollerTokenProvider } from "../../roller/oauth-client.js";
import { createAuthenticatedRollerWebhookClient } from "../../roller/webhook-client.js";

describe("ROLLER OAuth token provider", () => {
  it("reuses the current access token until it expires", async () => {
    let nowMs = Date.parse("2026-04-28T10:00:00.000Z");
    const tokenRequests: string[] = [];
    const tokenContentTypes: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      tokenRequests.push(String(input));
      tokenContentTypes.push(String(new Headers(init?.headers).get("Content-Type")));

      return new Response(
        JSON.stringify({
          access_token: `token-${tokenRequests.length}`,
          expires_in: 60
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    };

    const tokenProvider = createRollerTokenProvider({
      baseUrl: "https://api.roller.app",
      clientId: "client-id",
      clientSecret: "client-secret",
      fetchImpl,
      now: () => new Date(nowMs)
    });

    await expect(tokenProvider.getAccessToken()).resolves.toBe("token-1");
    await expect(tokenProvider.getAccessToken()).resolves.toBe("token-1");

    nowMs += 61_000;

    await expect(tokenProvider.getAccessToken()).resolves.toBe("token-2");
    expect(tokenRequests).toEqual([
      "https://api.roller.app/token",
      "https://api.roller.app/token"
    ]);
    expect(tokenContentTypes).toEqual(["application/json", "application/json"]);
  });

  it("requests a fresh token and retries once when ROLLER returns 401", async () => {
    const tokenBodies: Array<Record<string, string>> = [];
    const webhookAuthHeaders: string[] = [];
    let tokenCallCount = 0;
    let webhookCallCount = 0;

    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);

      if (url === "https://api.roller.app/token") {
        tokenCallCount += 1;
        tokenBodies.push(JSON.parse(String(init?.body)));

        return new Response(
          JSON.stringify({
            access_token: `token-${tokenCallCount}`,
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

      webhookCallCount += 1;
      webhookAuthHeaders.push(String(new Headers(init?.headers).get("Authorization")));

      if (webhookCallCount === 1) {
        return new Response("Unauthorized", { status: 401 });
      }

      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    };

    const tokenProvider = createRollerTokenProvider({
      baseUrl: "https://api.roller.app",
      clientId: "client-id",
      clientSecret: "client-secret",
      fetchImpl
    });
    const client = createAuthenticatedRollerWebhookClient({
      baseUrl: "https://api.roller.app",
      tokenProvider,
      fetchImpl
    });

    await expect(client.listWebhooks()).resolves.toEqual([]);
    expect(webhookAuthHeaders).toEqual(["Bearer token-1", "Bearer token-2"]);
    expect(tokenBodies).toEqual([
      {
        grant_type: "client_credentials",
        client_id: "client-id",
        client_secret: "client-secret"
      },
      {
        grant_type: "client_credentials",
        client_id: "client-id",
        client_secret: "client-secret"
      }
    ]);
  });

  it("logs token creation steps with payload details", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(
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
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
    const tokenProvider = createRollerTokenProvider({
      baseUrl: "https://api.roller.app",
      clientId: "client-id",
      clientSecret: "client-secret",
      fetchImpl,
      now: () => new Date("2026-04-28T10:00:00.000Z")
    });

    await expect(tokenProvider.getAccessToken()).resolves.toBe("token-1");

    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "roller_oauth_debug",
        step: "request_access_token_start",
        tokenUrl: "https://api.roller.app/token",
        payload: expect.objectContaining({
          grant_type: "client_credentials",
          client_id: "client-id",
          client_secret: "[REDACTED]"
        })
      })
    );
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "roller_oauth_debug",
        step: "access_token_created",
        expiresInSeconds: 60
      })
    );

    consoleInfo.mockRestore();
  });
});
