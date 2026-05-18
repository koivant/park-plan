import { describe, expect, it } from "vitest";
import { getActiveRollerWebhookDetails } from "../../roller/webhook-inspector.js";
import type { RollerWebhookRecord } from "../../roller/types.js";

describe("ROLLER webhook inspector", () => {
  it("returns active webhook details when available", () => {
    const result = getActiveRollerWebhookDetails([
      {
        id: "inactive",
        type: "booking",
        url: "https://example.com/inactive",
        enabled: false,
        events: ["Created"]
      },
      {
        id: "active-booking",
        type: "booking",
        url: "https://example.com/booking",
        enabled: true,
        events: ["Created", "Updated"],
        configuration: {
          authentication: {
            apiKey: "secret",
            isBasicAuthentication: false
          },
          webhooks: {
            booking: {
              include: {
                tickets: true
              },
              filter: {
                channels: ["VenueManager"]
              }
            }
          }
        }
      },
      {
        id: "active-waiver",
        type: "signedWaiver",
        url: "https://example.com/waiver",
        enabled: true,
        configuration: {
          webhooks: {
            signedWaiver: {
              events: ["Created"]
            }
          }
        }
      }
    ] satisfies RollerWebhookRecord[]);

    expect(result).toEqual([
      {
        id: "active-booking",
        type: "booking",
        url: "https://example.com/booking",
        enabled: true,
        events: ["Created", "Updated"],
        authentication: {
          hasApiKey: true,
          isBasicAuthentication: false
        },
        include: {
          tickets: true
        },
        filter: {
          channels: ["VenueManager"]
        }
      },
      {
        id: "active-waiver",
        type: "signedWaiver",
        url: "https://example.com/waiver",
        enabled: true,
        events: ["Created"],
        authentication: {
          hasApiKey: false,
          isBasicAuthentication: false
        },
        include: {},
        filter: {}
      }
    ]);
  });
});
