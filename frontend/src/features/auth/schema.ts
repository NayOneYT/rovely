import { z } from "zod"
import parsePhoneNumberFromString from "libphonenumber-js"
import {
  emptyToUndefined,
  phoneSchema, codeSchema, nameSchema, usernameSchema, emailSchema, tokenSchema
} from "@/shared/schemas"

const identifierSchema = emptyToUndefined(z
  .string({ required_error: "Обязательное поле" })
  .min(4, "Минимум 4 символа")
  .max(254)
  .refine((value) => {
    const isLogin = /^[a-zа-яё0-9._-]+$/.test(value)
    const isEmail = z.string().email().safeParse(value).success
    const isPhone = parsePhoneNumberFromString(value)?.isValid()
    return isEmail || isLogin || isPhone
  }, "Неверный формат")
)

const passwordSchema = emptyToUndefined(z
  .string({ required_error: "Обязательное поле" })
  .min(6, "Минимум 6 символов")
  .max(72)
  .regex(/^[^\p{Extended_Pictographic}]+$/u, "Недопустимые символы")
)

const rememberMeSchema = z
  .boolean()
  .default(false)

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
  rememberMe: rememberMeSchema
})

export const loginWithPhoneSchema = z.object({
  phone: phoneSchema,
  code: codeSchema,
  rememberMe: rememberMeSchema
})

const sendLoginWithPhoneSchema = z.object({
  phone: phoneSchema,
})

const checkAvailabilitySchema = z.object({
  field: z
    .enum(["username", "email", "phone", "login"]),
  value: z
    .string()
    .min(1)
    .max(254)
})

export const registerSchema = z.object({
  name: nameSchema
    .optional(),
  username: usernameSchema
    .optional(),
  email: emailSchema
    .optional(),
  phone: phoneSchema
    .optional(),
  login: emptyToUndefined(z
    .string({ required_error: "Обязательное поле" })
    .min(4, "Минимум 4 символа")
    .max(50)
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9._-]+$/, "Только латиница, кирилица, цифры и ._-")
  ),
  password: passwordSchema
})

export const passwordRecoveryContactsSchema = z.object({
  identifier: identifierSchema,
})

const sendPasswordRecoverySchema = z.object({
  identifier: identifierSchema,
  to: z
    .enum(["EMAIL", "PHONE"])
})

const checkPasswordRecoveryToken = z.object({
  token: tokenSchema
})

export const resetPasswordSchema = z.object({
  token: tokenSchema,
  password: passwordSchema
})

export type LoginDto = z.infer<typeof loginSchema>
export type LoginWithPhoneDto = z.infer<typeof loginWithPhoneSchema>
export type SendLoginWithPhoneDto = z.infer<typeof sendLoginWithPhoneSchema>
export type CheckAvailabilityDto = z.infer<typeof checkAvailabilitySchema>
export type RegisterDto = z.infer<typeof registerSchema>
export type PasswordRecoveryContactsDto = z.infer<typeof passwordRecoveryContactsSchema>
export type SendPasswordRecoveryDto = z.infer<typeof sendPasswordRecoverySchema>
export type CheckPasswordRecoveryTokenDto = z.infer<typeof checkPasswordRecoveryToken>
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>