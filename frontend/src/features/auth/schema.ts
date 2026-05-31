import { z } from "zod"
import parsePhoneNumberFromString from "libphonenumber-js"
import { discardEmpty } from "@/lib/discardEmpty"

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(4, "Минимум 4 символа")
    .refine((value) => {
      const isEmail = z.string().email().safeParse(value).success
      const isLogin = /^[a-zA-Zа-яА-ЯёЁ0-9._-]+$/.test(value)
      return isEmail || isLogin
    }, "Неверный формат"),
  password: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(6, "Минимум 6 символов")
    .regex(/^[^\p{Extended_Pictographic}]+$/u, "Недопустимые символы"),
  rememberMe: z
    .boolean()
    .optional()
})

export const loginWithPhoneSchema = z.object({
  phone: z
    .string({ required_error: "Обязательное поле" })
    .refine((value) => parsePhoneNumberFromString(value)?.isValid(), "Неверный формат"),
  code: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .length(6, "Код должен содержать ровно 6 символов")
    .regex(/^\d+$/, "Неверный формат"),
  rememberMe: z
    .boolean()
    .optional()
})

export const registrationSchema = z.object({
  name: z
    .string()
    .optional(),
  username: discardEmpty.pipe(z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, "Только латиница и цифры")
    .optional()),
  email: discardEmpty.pipe(z
    .string()
    .email("Неверный формат")
    .optional()),
  phone: discardEmpty.pipe(z
    .string()
    .refine((value) => parsePhoneNumberFromString(value)?.isValid(), "Неверный формат")
    .optional()),
  login: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(4, "Минимум 4 символа")
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9._-]+$/, "Только латиница, кирилица, цифры и ._-"),
  password: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(6, "Минимум 6 символов")
    .regex(/^[^\p{Extended_Pictographic}]+$/u, "Недопустимые символы")
})

export type LoginDto = z.infer<typeof loginSchema>
export type LoginWithPhoneDto = z.infer<typeof loginWithPhoneSchema>
export type RegistrationDto = z.infer<typeof registrationSchema>