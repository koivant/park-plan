import { z } from "zod";
import { emailSchema } from "../../schema/core.js";

export const patchContactUpdatedBodySchema = z
  .object({
    email: emailSchema.optional(),
    phone: z.string().min(1).optional(),
    roller_id: z.unknown().optional(),
    rollerId: z.unknown().optional(),
    punchcard: z.unknown().optional(),
    patchContactId: z.unknown().optional(),
    loyaltyPoints: z.coerce.number().int().optional(),
    loyaltyTarget: z.coerce.number().int().nullable().optional()
  })
  .passthrough();

export const patchRewardCodeBodySchema = z
  .object({
    email: emailSchema.optional(),
    discount_code: z.unknown().optional(),
    phone: z.string().min(1).optional()
  })
  .passthrough();
