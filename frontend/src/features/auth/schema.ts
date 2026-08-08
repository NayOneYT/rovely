import { z } from "zod"
import {
  makeOptional,
  passwordSchema, loginSchema as loginFieldSchema, emailSchema, phoneSchema, identifierSchema, codeSchema, nameSchema, usernameSchema, tokenSchema,
} from "@/shared/schemas"

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
  name: makeOptional(nameSchema),
  username: makeOptional(usernameSchema),
  email: makeOptional(emailSchema),
  phone: makeOptional(phoneSchema),
  login: loginFieldSchema,
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