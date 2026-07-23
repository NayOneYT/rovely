import { emptyToUndefined } from "./common"
import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export const accountIdSchema = z
  .string()
  .cuid()

export const phoneSchema = emptyToUndefined(z
  .string({ required_error: "Обязательное поле" })
  .refine((value) => parsePhoneNumberFromString(value)?.isValid(), "Неверный формат")
)

export const nameSchema = emptyToUndefined(z
  .string({ required_error: "Обязательное поле" })
  .max(30)
)

export const usernameSchema = emptyToUndefined(z
  .string({ required_error: "Обязательное поле" })
  .min(3, "Минимум 3 символа")
  .max(30)
  .regex(/^[a-zA-Z0-9]+$/)
)

export const emailSchema = emptyToUndefined(z
  .string({ required_error: "Обязательное поле" })
  .email("Неверный формат")
)