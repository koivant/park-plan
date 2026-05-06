import type { z } from "zod";
import type { NormalizedRollerBooking } from "../types/webhooks.js";
import { numberOrUndefined, stringOrUndefined } from "../../utils/primitives.js";
import { isRecord, isRecordArray } from "../../utils/records.js";
import { rollerBookingBodySchema, rollerSignedWaiverBodySchema } from "../schema/webhooks.js";

type RollerBookingPayload = z.infer<typeof rollerBookingBodySchema>["data"];
type RollerSignedWaiverPayload = z.infer<typeof rollerSignedWaiverBodySchema>["data"];

export interface NormalizedWaiverRecord {
  waiverId: string;
  status: string;
  signedAt?: string;
  isForMinor?: boolean;
  guestId?: string;
  versionWaiverId: string;
  expiryDate?: string;
  parentWaiverId?: string;
}

/** Normalizes a booking webhook payload into persistence-ready fields. */
export function normalizeRollerBookingPayload(payload: RollerBookingPayload): NormalizedRollerBooking {
  const parkIds = extractParkIds(payload);
  const bookingReference = stringOrUndefined(payload.bookingReference);
  const { bookingDate, bookingEndDate } = getBookingDateRange(payload.items);
  return {
    bookingId: String(payload.uniqueId ?? payload.bookingReference),
    bookingReference,
    rollerCustomerId: stringOrUndefined(payload.customerId),
    loyaltyEnrollmentAllowed: getLoyaltyEnrollmentAllowed(payload),
    email: typeof payload.email === "string" ? payload.email.trim().toLowerCase() : undefined,
    firstName: stringOrUndefined(payload.firstName),
    lastName: stringOrUndefined(payload.lastName),
    name: stringOrUndefined(payload.name),
    phone: getBookingPhone(payload),
    source: stringOrUndefined(payload.source),
    channel: stringOrUndefined(payload.channel),
    venue: stringOrUndefined(payload.venue),
    parkId: parkIds[0],
    parkIds,
    bookingDate,
    bookingEndDate,
    startsAt: stringOrUndefined(payload.startsAt) ?? buildBookingStartsAt(payload.items),
    ticketCount: numberOrUndefined(payload.ticketCount) ?? sumBookingItemQuantity(payload.items),
    status: stringOrUndefined(payload.status)
  };
}

/** Flattens signed waiver records into persistence-friendly entries. */
export function createWaiverProjectionEntries(payload: RollerSignedWaiverPayload): NormalizedWaiverRecord[] {
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

function getBookingDateRange(value: unknown): { bookingDate?: string; bookingEndDate?: string } {
  const items = normalizeBookingItems(value);
  if (items.length === 0) {
    return {};
  }

  const starts = items.map((item) => stringOrUndefined(item.bookingDate)).filter(isNonEmptyString);
  const ends = items.map((item) => stringOrUndefined(item.bookingEndDate)).filter(isNonEmptyString);

  const bookingDate = starts.length > 0 ? starts.sort()[0] : undefined;
  const bookingEndDate = ends.length > 0 ? ends.sort().at(-1) : undefined;

  return {
    bookingDate,
    bookingEndDate
  };
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

function extractParkIds(payload: RollerBookingPayload): string[] {
  const ids = new Set<string>();

  const directParkId = stringOrUndefined(payload.venueId) ?? stringOrUndefined(payload.locationId);
  if (directParkId) {
    ids.add(directParkId);
  }

  for (const item of normalizeBookingItems(payload.items)) {
    const tickets = isRecordArray(item.tickets);
    for (const ticket of tickets) {
      const locations = Array.isArray(ticket.locations) ? ticket.locations : [];
      for (const location of locations) {
        const parkId = stringOrUndefined(location);
        if (parkId) {
          ids.add(parkId);
        }
      }
    }
  }

  return [...ids];
}

function getLoyaltyEnrollmentAllowed(payload: RollerBookingPayload): boolean | undefined {
  for (const key of [
    "loyaltyEnrollmentAllowed",
    "loyaltyEnrolmentAllowed",
    "enrollInLoyalty",
    "enrolInLoyalty",
    "joinLoyalty",
    "joinedLoyalty",
    "loyaltyOptIn",
    "loyaltyOptedIn"
  ]) {
    const value = payload[key as keyof RollerBookingPayload];
    if (typeof value === "boolean") {
      return value;
    }
  }

  const customerFlags = Array.isArray(payload.customerFlags) ? payload.customerFlags : [];
  if (customerFlags.length === 0) {
    return undefined;
  }

  const normalizedFlags = customerFlags
    .filter((flag): flag is string => typeof flag === "string")
    .map(normalizeLoyaltyFlag);

  if (
    normalizedFlags.some((flag) =>
      [
        "loyalty_enrollment_allowed",
        "loyalty_enrolment_allowed",
        "loyalty_opt_in",
        "loyalty_opted_in",
        "joined_loyalty",
        "enrolled_in_loyalty",
        "enrolment_allowed"
      ].includes(flag)
    )
  ) {
    return true;
  }

  if (
    normalizedFlags.some((flag) =>
      [
        "loyalty_enrollment_denied",
        "loyalty_enrolment_denied",
        "loyalty_opt_out",
        "loyalty_opted_out",
        "do_not_enroll_loyalty"
      ].includes(flag)
    )
  ) {
    return false;
  }

  return undefined;
}

function normalizeLoyaltyFlag(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function getBookingPhone(payload: RollerBookingPayload): string | undefined {
  for (const key of ["phone", "contactNumber", "mobileNumber", "mobile", "phoneNumber"]) {
    const value = payload[key as keyof RollerBookingPayload];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
