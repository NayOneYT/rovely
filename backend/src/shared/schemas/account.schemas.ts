import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export const accountIdSchema = z
  .string()
  .cuid()

export const nameSchema = z
  .string()
  .min(1)
  .max(30)

export const nameWithDefaultSchema = nameSchema
  .default("Некто")

export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9]+$/)

export const emailSchema = z
  .string()
  .email()

export const phoneSchema = z
  .string()
  .transform((value) => parsePhoneNumberFromString(value))
  .refine((value) => value?.isValid(), "Invalid format")
  .transform((value) => value?.number as string)

export const normalizePhoneNumber = (value: string) => {
  const phone = parsePhoneNumberFromString(value)
  return phone?.isValid() ? phone.number as string : value
}