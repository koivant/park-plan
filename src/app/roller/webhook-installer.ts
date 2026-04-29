import type { ManagedRollerWebhook, RollerWebhookClient, RollerWebhookCreatePayload, RollerWebhookRecord } from "./types.js";

export interface SyncRollerWebhooksOptions {
  client: RollerWebhookClient;
  desiredWebhooks: ManagedRollerWebhook[];
}

export interface SyncRollerWebhooksResult {
  created: string[];
  unchanged: string[];
  replaced: string[];
}

/** Builds the managed webhook set for this app from the public base URL. */
export function createManagedRollerWebhooks(loyaltyAppBaseUrl: string, webhookAuthApiKey: string): ManagedRollerWebhook[] {
  const baseUrl = loyaltyAppBaseUrl.replace(/\/+$/, "");

  return [
    {
      key: "booking",
      createPayload: {
        url: `${baseUrl}/webhooks/roller/booking`,
        enabled: true,
        authentication: {
          apiKey: webhookAuthApiKey
        },
        webhooks: {
          booking: {
            events: ["Created", "Updated", "Cancelled"],
            include: {
              externalId: true,
              tickets: true,
              membershipDetail: true,
              locations: true,
              customerFlags: true,
              payments: true
            }
          }
        }
      }
    },
    {
      key: "signed-waiver",
      createPayload: {
        url: `${baseUrl}/webhooks/roller/signed-waiver`,
        enabled: true,
        authentication: {
          apiKey: webhookAuthApiKey
        },
        webhooks: {
          signedWaiver: {
            events: ["Created"]
          }
        }
      }
    }
  ];
}

/**
 * Reconciles ROLLER webhooks against the desired managed set.
 * Matching webhooks are kept, missing ones are created, and drifted
 * managed webhooks are replaced by delete+create.
 */
export async function syncRollerWebhooks(options: SyncRollerWebhooksOptions): Promise<SyncRollerWebhooksResult> {
  const existingWebhooks = await options.client.listWebhooks();
  const result: SyncRollerWebhooksResult = {
    created: [],
    unchanged: [],
    replaced: []
  };

  for (const desiredWebhook of options.desiredWebhooks) {
    const desiredType = getWebhookTypeFromPayload(desiredWebhook.createPayload);
    const matchingWebhook = existingWebhooks.find(
      (webhook) =>
        normalizeUrl(getWebhookUrl(webhook)) === normalizeUrl(desiredWebhook.createPayload.url) &&
        normalizeType(getWebhookType(webhook)) === normalizeType(desiredType)
    );

    if (!matchingWebhook) {
      await options.client.createWebhook(desiredWebhook.createPayload);
      result.created.push(desiredWebhook.key);
      continue;
    }

    if (webhookMatchesDesiredState(matchingWebhook, desiredWebhook.createPayload)) {
      result.unchanged.push(desiredWebhook.key);
      continue;
    }

    await options.client.deleteWebhook(matchingWebhook.id);
    await options.client.createWebhook(desiredWebhook.createPayload);
    result.replaced.push(desiredWebhook.key);
  }

  return result;
}

function webhookMatchesDesiredState(webhook: RollerWebhookRecord, desiredWebhook: RollerWebhookCreatePayload): boolean {
  const desiredType = getWebhookTypeFromPayload(desiredWebhook);
  return (
    normalizeType(getWebhookType(webhook)) === normalizeType(desiredType) &&
    webhook.enabled === desiredWebhook.enabled &&
    normalizeEvents(webhook.events).join("|") === normalizeEvents(getWebhookEventsFromPayload(desiredWebhook)).join("|") &&
    normalizeIncludeFlags(webhook.configuration?.webhooks?.[getWebhookType(webhook)]?.include).join("|") ===
      normalizeIncludeFlags(getWebhookIncludeFromPayload(desiredWebhook)).join("|")
  );
}

function getWebhookType(webhook: RollerWebhookRecord): string {
  if (typeof webhook.type === "string") {
    return webhook.type;
  }

  const types = Object.keys(webhook.configuration?.webhooks ?? {});
  return types[0] ?? "";
}

function getWebhookUrl(webhook: RollerWebhookRecord): string {
  for (const value of [webhook.url, webhook.endpointUrl, webhook.callbackUrl]) {
    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function normalizeType(type: string): string {
  return type.replace(/[-_]/g, "").toLowerCase();
}

/**
 * Normalizes event definitions from either an array or an object map
 * into a deterministic sorted list for equality checks.
 */
function normalizeEvents(events: Record<string, unknown> | string[] | undefined | null): string[] {
  if (!events) {
    return [];
  }

  if (Array.isArray(events)) {
    return events.map(String).sort();
  }

  return Object.entries(events)
    .filter(([, value]) => value === true)
    .map(([key]) => key)
    .sort();
}

function getWebhookTypeFromPayload(payload: RollerWebhookCreatePayload): string {
  return Object.keys(payload.webhooks)[0] ?? "";
}

function getWebhookEventsFromPayload(payload: RollerWebhookCreatePayload): string[] {
  const type = getWebhookTypeFromPayload(payload);
  return payload.webhooks[type]?.events ?? [];
}

function getWebhookIncludeFromPayload(payload: RollerWebhookCreatePayload): Record<string, boolean> | undefined {
  const type = getWebhookTypeFromPayload(payload);
  return payload.webhooks[type]?.include;
}

function normalizeIncludeFlags(include: Record<string, boolean> | undefined): string[] {
  if (!include) {
    return [];
  }

  return Object.entries(include)
    .filter(([, value]) => value === true)
    .map(([key]) => key)
    .sort();
}
