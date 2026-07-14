import { z } from "zod"
import { phoneSchema, codeSchema, accountIdSchema, nameSchema } from "@/schemas/index.js"

export const verifyPhoneSchema = z.object({
  phone: phoneSchema,
  code: codeSchema,
  accountId: accountIdSchema
})

export const checkRegistrationPhoneVerificationSchema = z.object({
  phone: phoneSchema
})

export const sendVerificationCodeSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  accountId: accountIdSchema
})

export type SendVerificationCodeDto = z.infer<typeof sendVerificationCodeSchema>
export type VerifyPhoneDto = z.infer<typeof verifyPhoneSchema>