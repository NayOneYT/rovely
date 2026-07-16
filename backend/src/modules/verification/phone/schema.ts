import { z } from "zod"
import { phoneSchema, codeSchema, accountIdSchema, nameSchema } from "@/schemas/index.js"

export const verifySchema = z.object({
  phone: phoneSchema,
  code: codeSchema,
  accountId: accountIdSchema
})

export const checkRegistrationSchema = z.object({
  phone: phoneSchema
})

export const sendSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  accountId: accountIdSchema
})

export type SendDto = z.infer<typeof sendSchema>
export type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>
export type VerifyDto = z.infer<typeof verifySchema>