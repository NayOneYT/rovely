import { z } from "zod"
import { phoneSchema, codeSchema, accountIdSchema, nameWithDefaultSchema, valueOrNull } from "@/shared/schemas/index.js"

export const verifySchema = z.object({
  phone: phoneSchema,
  code: codeSchema,
  accountId: valueOrNull(accountIdSchema)
})

export const checkRegistrationSchema = z.object({
  phone: phoneSchema
})

export const sendSchema = z.object({
  phone: phoneSchema,
  name: nameWithDefaultSchema,
  accountId: valueOrNull(accountIdSchema)
})

export type SendDto = z.infer<typeof sendSchema>
export type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>
export type VerifyDto = z.infer<typeof verifySchema>