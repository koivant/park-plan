import { describe, expect, it } from "vitest";
import { createManagedRollerWebhooks, syncRollerWebhooks } from "../roller/webhook-installer.js";
import type { RollerWebhookClient, RollerWebhookRecord } from "../roller/types.js";

function createClient(existingWebhooks: RollerWebhookRecord[] = []): RollerWebhookClient & {
  created: unknown[];
  deleted: string[];
} {
  const created: unknown[] = [];
  const deleted: string[] = [];

  return {
    created,
    deleted,
    async listWebhooks() {
      return existingWebhooks;
    },
    async createWebhook(payload) {
      created.push(payload);
      return {
        id: `created-${created.length}`,
        ...payload
      };
    },
    async deleteWebhook(id) {
      deleted.push(id);
    }
  };
}

describe("ROLLER webhook installer", () => {
  it("builds the managed booking and signed-waiver webhooks for the loyalty app", () => {
    const desired = createManagedRollerWebhooks("https://loyalty.example.com", "webhook-key");

    expect(desired).toEqual([
      {
        key: "booking",
        createPayload: {
          url: "https://loyalty.example.com/webhooks/roller/booking",
          enabled: true,
          authentication: {
            apiKey: "webhook-key"
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
          url: "https://loyalty.example.com/webhooks/roller/signed-waiver",
          enabled: true,
          authentication: {
            apiKey: "webhook-key"
          },
          webhooks: {
            signedWaiver: {
              events: ["Created"]
            }
          }
        }
      }
    ]);
  });

  it("creates missing managed webhooks", async () => {
    const client = createClient();
    const desired = createManagedRollerWebhooks("https://loyalty.example.com", "webhook-key");

    const result = await syncRollerWebhooks({ client, desiredWebhooks: desired });

    expect(result).toEqual({
      created: ["booking", "signed-waiver"],
      unchanged: [],
      replaced: []
    });
    expect(client.created).toHaveLength(2);
    expect(client.deleted).toEqual([]);
  });

  it("leaves matching managed webhooks unchanged", async () => {
    const client = createClient([
      {
        id: "booking-id",
        type: "booking",
        url: "https://loyalty.example.com/webhooks/roller/booking",
        enabled: true,
        events: ["Created", "Updated", "Cancelled"],
        configuration: {
          webhooks: {
            booking: {
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
        id: "waiver-id",
        type: "signedWaiver",
        url: "https://loyalty.example.com/webhooks/roller/signed-waiver",
        enabled: true,
        events: ["Created"]
      }
    ]);
    const desired = createManagedRollerWebhooks("https://loyalty.example.com", "webhook-key");

    const result = await syncRollerWebhooks({ client, desiredWebhooks: desired });

    expect(result).toEqual({
      created: [],
      unchanged: ["booking", "signed-waiver"],
      replaced: []
    });
    expect(client.created).toEqual([]);
    expect(client.deleted).toEqual([]);
  });

  it("replaces drifted managed webhooks without touching unrelated ones", async () => {
    const client = createClient([
      {
        id: "booking-old",
        type: "booking",
        url: "https://loyalty.example.com/webhooks/roller/booking",
        enabled: false,
        events: ["Created"]
      },
      {
        id: "other-integration",
        type: "booking",
        url: "https://another-app.example.com/webhooks/roller/booking",
        enabled: true,
        events: ["Created"]
      }
    ]);
    const desired = createManagedRollerWebhooks("https://loyalty.example.com", "webhook-key");

    const result = await syncRollerWebhooks({ client, desiredWebhooks: desired });

    expect(result).toEqual({
      created: ["signed-waiver"],
      unchanged: [],
      replaced: ["booking"]
    });
    expect(client.deleted).toEqual(["booking-old"]);
    expect(client.created).toEqual([
      {
        url: "https://loyalty.example.com/webhooks/roller/booking",
        enabled: true,
        authentication: {
          apiKey: "webhook-key"
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
      },
      {
        url: "https://loyalty.example.com/webhooks/roller/signed-waiver",
        enabled: true,
        authentication: {
          apiKey: "webhook-key"
        },
        webhooks: {
          signedWaiver: {
            events: ["Created"]
          }
        }
      }
    ]);
  });

  it("replaces booking webhook when include flags drift", async () => {
    const client = createClient([
      {
        id: "booking-drifted-include",
        type: "booking",
        url: "https://loyalty.example.com/webhooks/roller/booking",
        enabled: true,
        events: ["Created", "Updated", "Cancelled"],
        configuration: {
          webhooks: {
            booking: {
              include: {
                externalId: false,
                tickets: false,
                membershipDetail: false,
                locations: false,
                customerFlags: false,
                payments: false
              }
            }
          }
        }
      }
    ]);
    const desired = createManagedRollerWebhooks("https://loyalty.example.com", "webhook-key");

    const result = await syncRollerWebhooks({ client, desiredWebhooks: desired });

    expect(result).toEqual({
      created: ["signed-waiver"],
      unchanged: [],
      replaced: ["booking"]
    });
    expect(client.deleted).toEqual(["booking-drifted-include"]);
  });
});
