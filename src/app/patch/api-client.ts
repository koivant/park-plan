interface PatchApiClientOptions {
  baseUrl: string;
  apiKey: string;
  accountId: string;
  fetchImpl?: typeof fetch;
}

interface ListContactsOptions {
  limit?: number;
  offset?: number;
}

/** Minimal PATCH (CityGro) REST client authenticated by API key + account id. */
export function createPatchApiClient(options: PatchApiClientOptions) {
  const { baseUrl, apiKey, accountId, fetchImpl = fetch } = options;

  return {
    async listContacts(listOptions: ListContactsOptions = {}): Promise<unknown> {
      const search = new URLSearchParams();
      if (typeof listOptions.limit === "number") {
        search.set("limit", String(listOptions.limit));
      }

      if (typeof listOptions.offset === "number") {
        search.set("offset", String(listOptions.offset));
      }

      return request({
        fetchImpl,
        baseUrl,
        apiKey,
        accountId,
        method: "GET",
        path: `/contacts${search.toString() ? `?${search.toString()}` : ""}`,
        action: "list contacts"
      });
    }
  };
}

interface PatchRequestOptions {
  fetchImpl: typeof fetch;
  baseUrl: string;
  apiKey: string;
  accountId: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  action: string;
  body?: unknown;
}

async function request(options: PatchRequestOptions): Promise<unknown> {
  const { fetchImpl, baseUrl, apiKey, accountId, method, path, action, body } = options;

  if (!baseUrl) {
    throw new Error("PATCH API base URL is not configured");
  }

  if (!apiKey) {
    throw new Error("PATCH API key is not configured");
  }

  if (!accountId) {
    throw new Error("PATCH API account id is not configured");
  }

  const url = `${normalizeBaseUrl(baseUrl)}${path}`;
  const response = await fetchImpl(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Account-Id": accountId,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const responseBody = await parseResponse(response);
  if (!response.ok) {
    throw new Error(`PATCH ${action} failed with ${response.status}: ${stringifyResponseBody(responseBody)}`);
  }

  return responseBody;
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/v2")) {
    return trimmed;
  }

  return `${trimmed}/v2`;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function stringifyResponseBody(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
