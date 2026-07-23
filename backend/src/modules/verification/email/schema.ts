import { z } from "zod"
import { tokenSchema, emailSchema, nameWithDefaultSchema, accountIdSchema, valueOrNull } from "@/shared/schemas/index.js"

export const verifySchema = z.object({
  token: tokenSchema
})

export const checkRegistrationSchema = z.object({
  email: emailSchema
    .toLowerCase()
})

export const sendSchema = z.object({
  name: nameWithDefaultSchema,
  email: emailSchema,
  accountId: valueOrNull(accountIdSchema)
})

export type VerifyDto = z.infer<typeof verifySchema>
export type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>
export type SendDto = z.infer<typeof sendSchema>