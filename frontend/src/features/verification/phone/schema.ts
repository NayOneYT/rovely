import { z } from "zod"
import { phoneSchema, codeSchema, accountIdSchema, nameSchema } from "@/shared/schemas"

export const verifySchema = z.object({
  phone: phoneSchema,
  code: codeSchema,
  accountId: accountIdSchema
    .optional()
})

const checkRegistrationSchema = z.object({
  phone: phoneSchema
})

const sendSchema = z.object({
  phone: phoneSchema,
  name: nameSchema
    .optional(),
  accountId: accountIdSchema
    .optional()
})

export type SendDto = z.infer<typeof sendSchema>
export type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>
export type VerifyDto = z.infer<typeof verifySchema>