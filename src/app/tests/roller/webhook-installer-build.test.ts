import { describe, expect, it } from "vitest";
import { createManagedRollerWebhooks } from "../../roller/webhook-installer.js";

describe("ROLLER webhook payload builder", () => {
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
});
