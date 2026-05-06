import type express from "express";
import {
  findCustomerIdByBookingId,
  updateCustomerWaiverStatus,
  upsertBooking
} from "../../services/account-store.js";
import {
  findCustomerIdByEmail,
  findCustomerIdByPhone,
  findCustomerIdByRollerCustomerId,
  recordWebhook,
  upsertCustomer
} from "../../services/customer-store.js";
import type { Queryable } from "../../types/database.js";
import { stringOrUndefined } from "../../utils/primitives.js";
import { rollerBookingBodySchema, rollerSignedWaiverBodySchema } from "../schema/webhooks.js";
import { acknowledgeInvalidRollerWebhook } from "../utils/logging.js";
import {
  findPrimaryWaiverRecord,
  getWaiverStatus,
  normalizeRollerBookingPayload
} from "../utils/webhook-payloads.js";

interface RegisterRollerWebhookRoutesOptions {
  app: express.Application;
  db: Queryable;
  now: () => Date;
  rollerGuestLookup?: {
    getGuestDetail(customerId: string): Promise<unknown>;
  };
}

/** Registers inbound ROLLER webhook endpoints. */
export function registerRollerWebhookRoutes(options: RegisterRollerWebhookRoutesOptions): void {
  const { app, db } = options;

  const handleBookingWebhook: express.RequestHandler = async (req, res, next) => {
    try {
      const body = rollerBookingBodySchema.safeParse(req.body);
      if (!body.success) {
        acknowledgeInvalidRollerWebhook("/webhooks/roller/booking", body.error.flatten().fieldErrors);
        res.status(202).json({ ok: true });
        return;
      }

      await recordWebhook(db, "roller.booking", body.data, {
        providerEventId: body.data.id,
        eventDate: body.data.eventDate,
        sendDate: body.data.sendDate
      });
      const booking = normalizeRollerBookingPayload(body.data.data);
      const endpointParkId = readEndpointParkId(req.params);
      const resolvedParkId = booking.parkId ?? endpointParkId;
      let customerId: string | undefined;
      const existingCustomerIdByEmail = booking.email ? await findCustomerIdByEmail(db, booking.email) : undefined;
      const existingCustomerIdByPhone = booking.phone ? await findCustomerIdByPhone(db, booking.phone) : undefined;
      const existingCustomerIdByRollerCustomerId = booking.rollerCustomerId
        ? await findCustomerIdByRollerCustomerId(db, booking.rollerCustomerId)
        : undefined;
      const existingCustomerId = existingCustomerIdByEmail ?? existingCustomerIdByPhone ?? existingCustomerIdByRollerCustomerId;
      let resolvedEmail = booking.email;
      let resolvedPhone = booking.phone;
      let resolvedName = booking.name ?? buildWaiverName(booking.firstName, booking.lastName);

      if (
        (!resolvedEmail && !resolvedPhone) &&
        !existingCustomerIdByRollerCustomerId &&
        booking.rollerCustomerId &&
        options.rollerGuestLookup
      ) {
        console.info({
          type: "roller_guest_lookup_start",
          route: req.path,
          customerId: booking.rollerCustomerId
        });

        try {
          const guestDetail = await options.rollerGuestLookup.getGuestDetail(booking.rollerCustomerId);
          const guestContact = extractGuestContact(guestDetail);
          resolvedEmail = guestContact.email ?? resolvedEmail;
          resolvedPhone = guestContact.phone ?? resolvedPhone;
          resolvedName = guestContact.name ?? resolvedName;
          console.info({
            type: "roller_guest_lookup_result",
            route: req.path,
            customerId: booking.rollerCustomerId,
            hasEmail: Boolean(resolvedEmail),
            hasPhone: Boolean(resolvedPhone)
          });
        } catch (error) {
          console.warn({
            type: "roller_guest_lookup_failed",
            route: req.path,
            customerId: booking.rollerCustomerId,
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }

      if (resolvedEmail || resolvedPhone) {
        if (!existingCustomerId && booking.loyaltyEnrollmentAllowed !== true) {
          console.info({
            type: "roller_booking_contact_sync_skipped",
            route: "/webhooks/roller/booking",
            bookingId: booking.bookingId,
            reason: "loyalty_enrollment_not_allowed"
          });
          res.status(202).json({ ok: true });
          return;
        }

        customerId = await upsertCustomer(db, {
          email: resolvedEmail,
          name: resolvedName,
          phone: resolvedPhone,
          rollerCustomerId: booking.rollerCustomerId
        });
      } else {
        customerId = existingCustomerIdByRollerCustomerId ?? await findCustomerIdByBookingId(db, booking.bookingId);
        if (!customerId) {
          console.info({
            type: "roller_booking_contact_sync_skipped",
            route: "/webhooks/roller/booking",
            bookingId: booking.bookingId,
            reason: "no_email_and_unknown_booking"
          });
        }
      }

      await upsertBooking(db, {
        bookingId: booking.bookingId,
        customerId,
        bookingReference: booking.bookingReference,
        rollerCustomerId: booking.rollerCustomerId,
        parkId: resolvedParkId,
        parkName: booking.venue,
        source: booking.source,
        channel: booking.channel,
        bookingDate: booking.bookingDate,
        bookingEndDate: booking.bookingEndDate,
        startsAt: booking.startsAt,
        ticketCount: booking.ticketCount,
        status: booking.status ?? getStatusFromEventType(body.data.eventType),
        lastEventType: body.data.eventType,
        lastEventDate: body.data.eventDate,
        providerEventId: body.data.id
      });

      console.info({
        type: "roller_booking_processed",
        route: "/webhooks/roller/booking",
        bookingId: booking.bookingId,
        customerId: customerId ?? null
      });
      res.status(202).json({ ok: true });
    } catch (error) {
      next(error);
    }
  };

  app.post("/webhooks/roller/booking", handleBookingWebhook);
  app.post("/webhooks/roller/:parkId/booking", handleBookingWebhook);

  app.post("/webhooks/roller/signed-waiver", async (req, res, next) => {
    try {
      const body = rollerSignedWaiverBodySchema.safeParse(req.body);
      if (!body.success) {
        acknowledgeInvalidRollerWebhook("/webhooks/roller/signed-waiver", body.error.flatten().fieldErrors);
        res.status(202).json({ ok: true });
        return;
      }

      await recordWebhook(db, "roller.signed_waiver", body.data, {
        providerEventId: body.data.id,
        eventDate: body.data.eventDate,
        sendDate: body.data.sendDate
      });
      const primaryWaiver = findPrimaryWaiverRecord(body.data.data);
      const primaryWaiverEmail = primaryWaiver?.email;
      const primaryWaiverPhone = primaryWaiver?.contactNumber;
      if (!primaryWaiverEmail && !primaryWaiverPhone) {
        res.status(202).json({ ok: true });
        return;
      }

      const customerId = await upsertCustomer(db, {
        email: primaryWaiverEmail,
        name: buildWaiverName(primaryWaiver?.firstName, primaryWaiver?.lastName),
        phone: primaryWaiverPhone,
        rollerCustomerId: stringOrUndefined(primaryWaiver.guestId)
      });

      const latestWaiver = findLatestWaiverRecord(body.data.data);
      await updateCustomerWaiverStatus(db, {
        customerId,
        status: getWaiverStatus(readBooleanOrNull(latestWaiver.isValid)),
        signedAt: typeof latestWaiver.createdDate === "string" ? latestWaiver.createdDate : undefined,
        expiryDate: typeof latestWaiver.expiryDate === "string" ? latestWaiver.expiryDate : undefined
      });
      res.status(202).json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
}

function readEndpointParkId(params: Record<string, unknown> | undefined): string | undefined {
  if (!params) {
    return undefined;
  }

  const value = params.parkId;
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getStatusFromEventType(eventType: "Created" | "Updated" | "Cancelled" | "Deleted"): string | undefined {
  if (eventType === "Cancelled") {
    return "cancelled";
  }

  if (eventType === "Deleted") {
    return "deleted";
  }

  return undefined;
}

function buildWaiverName(firstName: unknown, lastName: unknown): string | undefined {
  const first = typeof firstName === "string" ? firstName.trim() : "";
  const last = typeof lastName === "string" ? lastName.trim() : "";
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name.length > 0 ? name : undefined;
}

function findLatestWaiverRecord(records: Array<Record<string, unknown>>): Record<string, unknown> {
  let latest = records[0] ?? {};
  let latestAt = toDateMillis(latest.createdDate);

  for (const record of records.slice(1)) {
    const currentAt = toDateMillis(record.createdDate);
    if (currentAt > latestAt) {
      latest = record;
      latestAt = currentAt;
    }
  }

  return latest;
}

function toDateMillis(value: unknown): number {
  if (typeof value !== "string") {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function readBooleanOrNull(value: unknown): boolean | null | undefined {
  if (typeof value === "boolean" || value === null) {
    return value;
  }

  return undefined;
}

function extractGuestContact(payload: unknown): { email?: string; phone?: string; name?: string } {
  const candidates = [payload, readNestedRecord(payload, "guest"), readNestedRecord(payload, "data"), readNestedRecord(payload, "customer")];

  for (const candidate of candidates) {
    if (!isRecord(candidate)) {
      continue;
    }

    const email = normalizeEmailString(
      readFirstString(candidate, ["email", "emailAddress", "email_address", "contactEmail", "contact_email"])
    );
    const phone = readFirstString(candidate, ["phone", "contactNumber", "mobileNumber", "mobile", "phoneNumber"]);
    const name =
      readFirstString(candidate, ["name", "fullName", "full_name"]) ??
      buildWaiverName(candidate.firstName, candidate.lastName) ??
      buildWaiverName(candidate.givenName, candidate.familyName);

    if (email || phone || name) {
      return {
        email,
        phone,
        name
      };
    }
  }

  return {};
}

function readNestedRecord(value: unknown, key: string): Record<string, unknown> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
}

function readFirstString(value: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return undefined;
}

function normalizeEmailString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();
  return normalized.includes("@") ? normalized : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
