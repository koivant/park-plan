import { config } from "../config.js";
import { createPatchApiClient } from "../patch/api-client.js";

async function main(): Promise<void> {
  const client = createPatchApiClient({
    baseUrl: config.patchApiBaseUrl,
    apiKey: config.patchApiKey,
    accountId: config.patchApiAccountId
  });

  const response = await client.listContacts({ limit: 1, offset: 0 });

  console.info({
    type: "patch_api_check",
    action: "list contacts",
    baseUrl: config.patchApiBaseUrl,
    accountId: config.patchApiAccountId,
    response
  });
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
