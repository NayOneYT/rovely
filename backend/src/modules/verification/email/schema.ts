import { z } from "zod"
import { tokenSchema, emailSchema, nameSchema, accountIdSchema } from "@/schemas/index.js"

export const verifyEmailSchema = z.object({
  token: tokenSchema
})

export const checkRegistrationEmailVerificationSchema = z.object({
  email: emailSchema
    .toLowerCase()
})

export const sendVerificationEmailSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  accountId: accountIdSchema
})

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>
export type SendVerificationEmailDto = z.infer<typeof sendVerificationEmailSchema>