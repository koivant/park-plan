import type { z } from "zod";
import type { NormalizedRollerBooking, WaiverProjectionEntry } from "../types/webhooks.js";
import { numberOrUndefined, stringOrUndefined } from "../../utils/primitives.js";
import { isRecord, isRecordArray } from "../../utils/records.js";
import { rollerBookingBodySchema, rollerSignedWaiverBodySchema } from "../schema/webhooks.js";

type RollerBookingPayload = z.infer<typeof rollerBookingBodySchema>["data"];
type RollerSignedWaiverPayload = z.infer<typeof rollerSignedWaiverBodySchema>["data"];

/** Normalizes a booking webhook payload into account-projection fields. */
export function normalizeRollerBookingPayload(payload: RollerBookingPayload): NormalizedRollerBooking {
  return {
    bookingId: String(payload.uniqueId ?? payload.bookingReference),
    rollerCustomerId: stringOrUndefined(payload.customerId),
    email: typeof payload.email === "string" ? payload.email.trim().toLowerCase() : undefined,
    firstName: stringOrUndefined(payload.firstName),
    lastName: stringOrUndefined(payload.lastName),
    name: stringOrUndefined(payload.name),
    phone: stringOrUndefined(payload.phone),
    venue: stringOrUndefined(payload.venue),
    startsAt: stringOrUndefined(payload.startsAt) ?? buildBookingStartsAt(payload.items),
    ticketCount: numberOrUndefined(payload.ticketCount) ?? sumBookingItemQuantity(payload.items),
    status: stringOrUndefined(payload.status)
  };
}

/** Flattens signed waiver records into projection entries. */
export function createWaiverProjectionEntries(payload: RollerSignedWaiverPayload): WaiverProjectionEntry[] {
  return payload.map((waiver) => ({
    waiverId: String(waiver.signedWaiverId),
    status: getWaiverStatus(waiver.isValid),
    signedAt: waiver.createdDate,
    isForMinor: waiver.isForMinor,
    guestId: stringOrUndefined(waiver.guestId),
    versionWaiverId: String(waiver.waiverId),
    expiryDate: waiver.expiryDate,
    parentWaiverId: stringOrUndefined(waiver.parentSignedWaiverId)
  }));
}

/** Returns the first signed waiver record that includes a customer email. */
export function findPrimaryWaiverRecord(payload: RollerSignedWaiverPayload): RollerSignedWaiverPayload[number] | undefined {
  return payload.find((waiver) => waiver.email);
}

/** Maps ROLLER waiver validity to the local account status string. */
export function getWaiverStatus(isValid: boolean | null | undefined): string {
  if (isValid === true) {
    return "valid";
  }

  if (isValid === false) {
    return "invalid";
  }

  return "signed";
}

function buildBookingStartsAt(value: unknown): string | undefined {
  const firstItem = normalizeBookingItems(value)[0];
  if (!firstItem) {
    return undefined;
  }

  const bookingDate = stringOrUndefined(firstItem.bookingDate);
  const sessionStartTime = stringOrUndefined(firstItem.sessionStartTime);
  if (!bookingDate || !sessionStartTime) {
    return undefined;
  }

  const normalizedTime = sessionStartTime.length === 5 ? `${sessionStartTime}:00` : sessionStartTime;
  return `${bookingDate}T${normalizedTime}.000Z`;
}

function sumBookingItemQuantity(value: unknown): number | undefined {
  const items = normalizeBookingItems(value);
  if (items.length === 0) {
    return undefined;
  }

  return items.reduce((sum, item) => sum + (numberOrUndefined(item.quantity) ?? 0), 0);
}

function normalizeBookingItems(value: unknown): Record<string, unknown>[] {
  const items = isRecordArray(value);
  if (items.length > 0) {
    return items;
  }

  if (isRecord(value)) {
    return [value];
  }

  return [];
}
