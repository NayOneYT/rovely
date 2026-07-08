import { z } from "zod"
import parsePhoneNumberFromString from "libphonenumber-js"
import { removeEmptyValues } from "@/utils/removeEmptyValues"

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
  username: removeEmptyValues.pipe(z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, "Только латиница и цифры")
    .optional()),
  email: removeEmptyValues.pipe(z
    .string()
    .email("Неверный формат")
    .optional()),
  phone: removeEmptyValues.pipe(z
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

export const passwordRecoveryContactsSchema = z.object({
  identifier: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(4, "Минимум 4 символа")
    .refine((value) => {
      const isEmail = z.string().email().safeParse(value).success
      const isLogin = /^[a-zA-Zа-яА-ЯёЁ0-9._-]+$/.test(value)
      return isEmail || isLogin
    }, "Неверный формат")
})

export interface ContactsDto {
  email?: string,
  phone?: string
}

const sendPasswordRecoverySchema = z.object({
  identifier: z
    .string(),
  to: z
    .enum(["EMAIL", "PHONE"], { required_error: "Обязательное поле" })
})

export interface SendPasswordRecoveryResultDto {
  type: "success" | "info",
  message: string,
  to: "EMAIL" | "PHONE",
  secondsLeft: number
}

export const checkPasswordRecoveryToken = z.object({
  token: z
    .string()
})

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]{64}$/),
  password: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(6, "Минимум 6 символов")
    .regex(/^[^\p{Extended_Pictographic}]+$/u, "Недопустимые символы")
})

export type LoginDto = z.infer<typeof loginSchema>
export type LoginWithPhoneDto = z.infer<typeof loginWithPhoneSchema>
export type RegistrationDto = z.infer<typeof registrationSchema>
export type PasswordRecoveryContactsDto = z.infer<typeof passwordRecoveryContactsSchema>
export type SendPasswordRecoveryDto = z.infer<typeof sendPasswordRecoverySchema>
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>