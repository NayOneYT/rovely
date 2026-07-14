import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export const accountIdSchema = z
  .union([
    z.literal("none"),
    z.string().cuid()
  ])
  .default("none")

export const nameSchema = z
  .string()
  .max(30)
  .default("Некто")

export const emailSchema = z
  .string()
  .email()

export const phoneSchema = z
  .string()
  .transform((value) => parsePhoneNumberFromString(value))
  .refine((value) => value?.isValid(), "Invalid format")
  .transform((value) => value?.number as string)