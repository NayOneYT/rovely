import { z } from "zod"
import { phoneSchema, codeSchema, nameWithDefaultSchema } from "@/shared/schemas/index.js"

export const verifySchema = z.object({
  phone: phoneSchema,
  code: codeSchema
})

export const checkRegistrationSchema = z.object({
  phone: phoneSchema
})

export const sendSchema = z.object({
  phone: phoneSchema,
  name: nameWithDefaultSchema
})

export type VerifyDto = z.infer<typeof verifySchema>
export type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>
export type SendDto = z.infer<typeof sendSchema>