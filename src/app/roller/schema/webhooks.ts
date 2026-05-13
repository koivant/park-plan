import { z } from "zod";
import { emailSchema } from "../../schema/core.js";

const rollerWebhookTypeSchema = z.preprocess(
  normalizeRollerWebhookType,
  z.enum(["Booking", "Redemption", "Customer", "BulkExport", "SignedWaiver", "PaymentLink"])
);

const rollerWebhookEventTypeSchema = z.preprocess(
  normalizeRollerWebhookEventType,
  z.enum(["Created", "Updated", "Cancelled", "Deleted"])
);

const rollerWebhookEnvelopeSchema = z.object({
  id: z.string().uuid(),
  sendDate: z.string().min(1),
  type: rollerWebhookTypeSchema,
  eventType: rollerWebhookEventTypeSchema,
  eventDate: z.string().min(1)
});

const rollerBookingItemSchema = z
  .object({
    quantity: z.coerce.number().int().optional(),
    bookingDate: z.string().min(1).optional(),
    sessionStartTime: z.string().min(1).optional(),
    sessionEndTime: z.string().min(1).optional()
  })
  .passthrough();

const rollerBookingDataSchema = z
  .object({
    bookingReference: z.union([z.string().min(1), z.coerce.number().int()]).optional(),
    uniqueId: z.string().min(1).optional(),
    customerId: z.union([z.string().min(1), z.coerce.number().int()]).optional(),
    name: z.string().min(1).optional(),
    createdDate: z.string().min(1).optional(),
    source: z.string().min(1).optional(),
    channel: z.string().min(1).optional(),
    venue: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    comments: z.string().optional(),
    total: z.coerce.number().optional(),
    remainder: z.coerce.number().optional(),
    amountOwing: z.coerce.number().optional(),
    fees: z.coerce.number().optional(),
    discount: z.coerce.number().optional(),
    posNotes: z.string().optional(),
    customerFlags: z.array(z.string()).optional(),
    items: z.union([rollerBookingItemSchema, z.array(rollerBookingItemSchema)]).optional()
  })
  .passthrough()
  .refine((value) => value.uniqueId != null || value.bookingReference != null, {
    message: "uniqueId_or_bookingReference_required",
    path: ["uniqueId"]
  });

const rollerSignedWaiverRecordSchema = z
  .object({
    signedWaiverId: z.union([z.string().min(1), z.coerce.number().int()]),
    parentSignedWaiverId: z.union([z.string().min(1), z.coerce.number().int()]).nullable().optional(),
    waiverId: z.union([z.string().min(1), z.coerce.number().int()]),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    guestId: z.union([z.string().min(1), z.coerce.number().int()]).nullable().optional(),
    dateOfBirth: z.string().min(1).optional(),
    email: emailSchema.optional(),
    contactNumber: z.string().min(1).optional(),
    isForMinor: z.boolean().optional(),
    expiryDate: z.string().min(1).optional(),
    isValid: z.boolean().nullable().optional(),
    createdDate: z.string().min(1).optional()
  })
  .passthrough();

export const rollerBookingBodySchema = rollerWebhookEnvelopeSchema
  .extend({
    type: rollerWebhookTypeSchema.pipe(z.literal("Booking")),
    data: z.preprocess(normalizeBookingWebhookData, rollerBookingDataSchema)
  })
  .passthrough();

export const rollerSignedWaiverBodySchema = rollerWebhookEnvelopeSchema
  .extend({
    type: rollerWebhookTypeSchema.pipe(z.literal("SignedWaiver")),
    data: z.array(rollerSignedWaiverRecordSchema).min(1)
  })
  .passthrough();

function normalizeRollerWebhookType(value: unknown): unknown {
  if (typeof value === "number") {
    return (
      {
        1: "Booking",
        3: "Redemption",
        4: "Customer",
        5: "BulkExport",
        7: "SignedWaiver",
        8: "PaymentLink"
      } as Record<number, string>
    )[value] ?? value;
  }

  if (typeof value === "string") {
    if (value === "Payment Link") {
      return "PaymentLink";
    }

    return value;
  }

  return value;
}

function normalizeRollerWebhookEventType(value: unknown): unknown {
  if (typeof value === "number") {
    return (
      {
        1: "Created",
        2: "Updated",
        3: "Cancelled",
        4: "Deleted"
      } as Record<number, string>
    )[value] ?? value;
  }

  return value;
}

function normalizeBookingWebhookData(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  if (isRecord(value.booking)) {
    return value.booking;
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
