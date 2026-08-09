import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export const accountIdSchema = z
  .string()
  .cuid()

export const passwordSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .regex(/^[^\p{Extended_Pictographic}]+$/u, "Без эмодзи и стикеров")
  .min(6, "Минимум 6 символов")
  .max(72)

export const loginSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .regex(/^[a-zA-Zа-яА-ЯёЁ0-9._-]+$/, "Только латиница, кирилица, цифры и ._-")
  .min(4, "Минимум 4 символа")
  .max(50)

export const emailSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .email("Неверный формат")

export const phoneSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .refine((value) => parsePhoneNumberFromString(value)?.isValid(), "Неверный формат")

export const identifierSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .min(4, "Минимум 4 символа")
  .max(254)
  .refine((value) => {
    const isLogin = loginSchema.safeParse(value).success
    const isEmail = emailSchema.safeParse(value).success
    const isPhone = phoneSchema.safeParse(value).success
    return isEmail || isLogin || isPhone
  }, "Неверный формат")

export const usernameSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .regex(/^[a-zA-Z0-9]+$/, "Только латиница и цифры")
  .min(3, "Минимум 3 символа")
  .max(30)

export const nameSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .max(30)