import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export const accountIdSchema = z
  .string()
  .cuid()

export const phoneSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .refine((value) => parsePhoneNumberFromString(value)?.isValid(), "Неверный формат")

export const nameSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .max(30)

export const usernameSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .min(3, "Минимум 3 символа")
  .max(30)
  .regex(/^[a-zA-Z0-9]+$/, "Неверный формат")

export const emailSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .email("Неверный формат")