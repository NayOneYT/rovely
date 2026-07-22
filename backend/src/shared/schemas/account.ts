import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export const normalizePhoneNumber = (value: string) => {
  const phone = parsePhoneNumberFromString(value)
  return phone?.isValid() ? phone.number as string : value
}

export const accountIdSchema = z
  .string()
  .cuid()

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