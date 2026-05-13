import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => value.includes("@"));

export const otpRequestBodySchema = z.object({
  email: emailSchema
});

export const otpVerifyBodySchema = z.object({
  email: emailSchema,
  otp: z.string().trim().min(1)
});

export const accountQuerySchema = z.object({
  email: emailSchema
});

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

export const joinSubmissionSchema = z.object({
  name: optionalTextSchema,
  email: emailSchema,
  phone: optionalTextSchema
});

export const errorResponseSchema = z.object({
  error: z.string()
});

export const healthResponseSchema = z.object({
  ok: z.boolean(),
  databaseTime: z.string().optional()
});

export const otpRequestResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
  demoOtp: z.string().optional()
});

export const otpVerifyResponseSchema = z.object({
  ok: z.boolean(),
  sessionToken: z.string()
});

const accountProfileSchema = z
  .object({
    email: emailSchema.optional(),
    name: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    phone: z.string().nullable().optional()
  })
  .passthrough();

const upcomingBookingSchema = z
  .object({
    bookingId: z.string().optional(),
    venue: z.string().optional(),
    parkId: z.string().optional(),
    startsAt: z.string().nullable().optional(),
    status: z.string().optional(),
    ticketCount: z.number().int().optional()
  })
  .passthrough();

const waiverSchema = z
  .object({
    waiverId: z.string().optional(),
    status: z.string().optional(),
    signedAt: z.string().nullable().optional(),
    documentUrl: z.string().nullable().optional()
  })
  .passthrough();

const homeParkSchema = z
  .object({
    parkId: z.string().nullable().optional(),
    parkName: z.string().nullable().optional()
  })
  .nullable();

const visitedParkSchema = z
  .object({
    parkId: z.string(),
    parkName: z.string().nullable().optional(),
    firstSeenAt: z.string().nullable().optional(),
    lastSeenAt: z.string().nullable().optional(),
    visitCount: z.number().int().optional()
  })
  .passthrough();

export const accountResponseSchema = z.object({
  email: emailSchema,
  loyalty_points: z.number().int(),
  loyalty_target: z.number().int().nullable(),
  home_park: homeParkSchema,
  visited_parks: z.array(visitedParkSchema),
  profile: accountProfileSchema,
  upcoming_bookings: z.array(upcomingBookingSchema),
  waivers: z.array(waiverSchema),
  discount_codes: z.array(
    z.object({
      code: z.string(),
      used: z.boolean(),
      issuedAt: z.string().nullable().optional(),
      usedAt: z.string().nullable().optional()
    })
  )
});

export const acceptedResponseSchema = z.object({
  ok: z.boolean()
});
