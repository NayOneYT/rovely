import { z } from "zod"
import {
  makeOptional,
  tokenSchema, emailSchema, nameSchema, accountIdSchema
} from "@/shared/schemas"

export const verifySchema = z.object({
  token: tokenSchema
})

const checkRegistrationSchema = z.object({
  email: emailSchema
})

export const sendSchema = z.object({
  name: makeOptional(nameSchema),
  email: emailSchema,
  accountId: makeOptional(accountIdSchema)
})

export type VerifyDto = z.infer<typeof verifySchema>
export type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>
export type SendDto = z.infer<typeof sendSchema>