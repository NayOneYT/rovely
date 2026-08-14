import { z } from "zod"
import {
  makeOptional,
  phoneSchema, codeSchema, nameSchema
} from "@/shared/schemas"

const verifySchema = z.object({
  phone: phoneSchema,
  code: codeSchema
})

const checkRegistrationSchema = z.object({
  phone: phoneSchema
})

export const sendSchema = z.object({
  phone: phoneSchema,
  name: makeOptional(nameSchema)
})

export type SendDto = z.infer<typeof sendSchema>
export type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>
export type VerifyDto = z.infer<typeof verifySchema>