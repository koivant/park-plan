import { describe, expect, it, vi } from "vitest";
import { createPatchApiClient } from "../../patch/api-client.js";

describe("PATCH API client", () => {
  it("sends Authorization and X-Account-Id headers", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ contacts: [] }), { status: 200, headers: { "content-type": "application/json" } }));
    const client = createPatchApiClient({
      baseUrl: "https://api.citygro.com/v2",
      apiKey: "patch-key",
      accountId: "1000",
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    await client.listContacts({ limit: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.citygro.com/v2/contacts?limit=1",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer patch-key",
          "X-Account-Id": "1000"
        })
      })
    );
  });

  it("throws a clear error when credentials are missing", async () => {
    const client = createPatchApiClient({
      baseUrl: "https://api.citygro.com/v2",
      apiKey: "",
      accountId: "1000",
      fetchImpl: vi.fn() as unknown as typeof fetch
    });

    await expect(client.listContacts({ limit: 1 })).rejects.toThrow("PATCH API key is not configured");
  });

  it("throws with status and body when PATCH API returns an error", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: "invalid_token" }), {
          status: 401,
          headers: { "content-type": "application/json" }
        })
    );
    const client = createPatchApiClient({
      baseUrl: "https://api.citygro.com/v2",
      apiKey: "patch-key",
      accountId: "1000",
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    await expect(client.listContacts({ limit: 1 })).rejects.toThrow(
      'PATCH list contacts failed with 401: {"error":"invalid_token"}'
    );
  });
});
