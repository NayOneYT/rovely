import { z } from "zod"
import { tokenSchema, emailSchema, nameSchema, accountIdSchema } from "@/shared/schemas"

export const verifySchema = z.object({
  token: tokenSchema
})

const checkRegistrationSchema = z.object({
  email: emailSchema
})

const sendSchema = z.object({
  name: nameSchema
    .optional(),
  email: emailSchema,
  accountId: accountIdSchema
    .optional()
})

export type VerifyDto = z.infer<typeof verifySchema>
export type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>
export type SendDto = z.infer<typeof sendSchema>