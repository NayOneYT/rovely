import { z } from "zod"
import {
  makeOptional,
  phoneSchema, codeSchema, accountIdSchema, nameSchema
} from "@/shared/schemas"

const verifySchema = z.object({
  phone: phoneSchema,
  code: codeSchema,
  accountId: makeOptional(accountIdSchema)
})

const checkRegistrationSchema = z.object({
  phone: phoneSchema
})

const sendSchema = z.object({
  phone: phoneSchema,
  name: makeOptional(nameSchema),
  accountId: makeOptional(accountIdSchema)
})

export type SendDto = z.infer<typeof sendSchema>
export type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>
export type VerifyDto = z.infer<typeof verifySchema>