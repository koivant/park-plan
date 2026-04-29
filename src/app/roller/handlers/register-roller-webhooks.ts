import type express from "express";
import { loadAccountProjection, mergeProfile, saveAccountProjection } from "../../services/account-store.js";
import { recordWebhook, upsertCustomer } from "../../services/customer-store.js";
import type { Queryable } from "../../types/database.js";
import { upsertByKey } from "../../utils/collections.js";
import { stringOrUndefined } from "../../utils/primitives.js";
import { rollerBookingBodySchema, rollerSignedWaiverBodySchema } from "../schema/webhooks.js";
import { acknowledgeInvalidRollerWebhook } from "../utils/logging.js";
import {
  createWaiverProjectionEntries,
  findPrimaryWaiverRecord,
  normalizeRollerBookingPayload
} from "../utils/webhook-payloads.js";

interface RegisterRollerWebhookRoutesOptions {
  app: express.Application;
  db: Queryable;
  now: () => Date;
}

/** Registers inbound ROLLER webhook endpoints. */
export function registerRollerWebhookRoutes(options: RegisterRollerWebhookRoutesOptions): void {
  const { app, db, now } = options;

  app.post("/webhooks/roller/booking", async (req, res, next) => {
    try {
      const body = rollerBookingBodySchema.safeParse(req.body);
      if (!body.success) {
        acknowledgeInvalidRollerWebhook("/webhooks/roller/booking", body.error.flatten().fieldErrors);
        res.status(202).json({ ok: true });
        return;
      }

      await recordWebhook(db, "roller.booking", body.data);
      const booking = normalizeRollerBookingPayload(body.data.data);
      if (!booking.email) {
        res.status(202).json({ ok: true });
        return;
      }

      const customerId = await upsertCustomer(db, {
        email: booking.email,
        rollerCustomerId: booking.rollerCustomerId
      });

      const projection = await loadAccountProjection(db, customerId);
      const profile = mergeProfile(projection.profile, {
        email: booking.email,
        firstName: booking.firstName,
        lastName: booking.lastName,
        name: booking.name,
        phone: booking.phone
      });
      const bookings = upsertByKey(projection.upcomingBookings, "bookingId", {
        bookingId: booking.bookingId,
        venue: booking.venue,
        startsAt: booking.startsAt,
        ticketCount: booking.ticketCount,
        status: booking.status
      });

      await saveAccountProjection(db, customerId, profile, bookings, projection.waivers, now());
      console.info({
        type: "roller_booking_processed",
        route: "/webhooks/roller/booking",
        bookingId: booking.bookingId,
        customerId
      });
      res.status(202).json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/webhooks/roller/signed-waiver", async (req, res, next) => {
    try {
      const body = rollerSignedWaiverBodySchema.safeParse(req.body);
      if (!body.success) {
        acknowledgeInvalidRollerWebhook("/webhooks/roller/signed-waiver", body.error.flatten().fieldErrors);
        res.status(202).json({ ok: true });
        return;
      }

      await recordWebhook(db, "roller.signed_waiver", body.data);
      const primaryWaiver = findPrimaryWaiverRecord(body.data.data);
      if (!primaryWaiver?.email) {
        res.status(202).json({ ok: true });
        return;
      }

      const customerId = await upsertCustomer(db, {
        email: primaryWaiver.email,
        rollerCustomerId: stringOrUndefined(primaryWaiver.guestId)
      });

      const projection = await loadAccountProjection(db, customerId);
      const profile = mergeProfile(projection.profile, {
        email: primaryWaiver.email,
        firstName: primaryWaiver.firstName,
        lastName: primaryWaiver.lastName,
        phone: primaryWaiver.contactNumber
      });

      let waivers = projection.waivers;
      for (const waiver of createWaiverProjectionEntries(body.data.data)) {
        waivers = upsertByKey(waivers, "waiverId", waiver);
      }

      await saveAccountProjection(db, customerId, profile, projection.upcomingBookings, waivers, now());
      res.status(202).json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
}
