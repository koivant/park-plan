import type { RollerWebhookRecord } from "./types.js";

export interface ActiveRollerWebhookDetail {
  id: string;
  type: string;
  url: string;
  enabled: true;
  events: string[];
  authentication: {
    hasApiKey: boolean;
    isBasicAuthentication: boolean;
  };
  include: Record<string, boolean>;
  filter: Record<string, unknown>;
}

/** Extracts active webhook details from ROLLER webhook records. */
export function getActiveRollerWebhookDetails(webhooks: RollerWebhookRecord[]): ActiveRollerWebhookDetail[] {
  const result: ActiveRollerWebhookDetail[] = [];

  for (const webhook of webhooks) {
    if (webhook.enabled !== true) {
      continue;
    }

    const type = typeof webhook.type === "string" ? webhook.type : "";
    const url = getWebhookUrl(webhook);
    const details = getTypeDetails(webhook, type);
    const events = normalizeEvents(webhook.events ?? details?.events);

    result.push({
      id: webhook.id,
      type,
      url,
      enabled: true,
      events,
      authentication: {
        hasApiKey: typeof webhook.configuration?.authentication?.apiKey === "string" && webhook.configuration.authentication.apiKey.length > 0,
        isBasicAuthentication: webhook.configuration?.authentication?.isBasicAuthentication === true
      },
      include: isRecordOfBooleans(details?.include) ? details.include : {},
      filter: isRecord(details?.filter) ? details.filter : {}
    });
  }

  return result;
}

function getWebhookUrl(webhook: RollerWebhookRecord): string {
  for (const value of [webhook.url, webhook.endpointUrl, webhook.callbackUrl, webhook.configuration?.url]) {
    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}

function getTypeDetails(
  webhook: RollerWebhookRecord,
  type: string
): { events?: string[]; include?: Record<string, boolean>; filter?: Record<string, unknown> } | undefined {
  if (!type) {
    return undefined;
  }

  return webhook.configuration?.webhooks?.[type];
}

function normalizeEvents(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .filter(([, enabled]) => enabled === true)
      .map(([event]) => event);
  }

  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRecordOfBooleans(value: unknown): value is Record<string, boolean> {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "boolean");
}
