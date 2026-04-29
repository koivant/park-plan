import { describe, expect, it } from "vitest";
import {
  createWaiverProjectionEntries,
  normalizeRollerBookingPayload
} from "../roller/utils/webhook-payloads.js";
import {
  normalizedRollerBooking,
  rollerBookingWebhookPayload,
  rollerSignedWaiverProjectionEntries,
  rollerSignedWaiverWebhookPayload
} from "./mocks/roller.js";

describe("ROLLER webhook utils", () => {
  it("normalizes booking detail payloads used by the loyalty account projection", () => {
    const booking = normalizeRollerBookingPayload(rollerBookingWebhookPayload.data);
    expect(booking).toEqual(normalizedRollerBooking);
  });

  it("creates flattened waiver projection entries from signed waiver payloads", () => {
    const entries = createWaiverProjectionEntries(rollerSignedWaiverWebhookPayload.data);
    expect(entries).toEqual(rollerSignedWaiverProjectionEntries);
  });
});
