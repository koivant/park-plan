import { z } from "zod";
import { emailSchema } from "../../schema/core.js";

export const patchContactUpdatedBodySchema = z
  .object({
    email: emailSchema.optional(),
    patchContactId: z.unknown().optional(),
    loyaltyPoints: z.coerce.number().int().optional(),
    loyaltyTarget: z.coerce.number().int().nullable().optional()
  })
  .passthrough();

export const patchRewardCodeBodySchema = z
  .object({
    email: emailSchema.optional(),
    patchContactId: z.unknown().optional(),
    code: z.unknown().optional(),
    codes: z.array(z.unknown()).optional()
  })
  .passthrough();
