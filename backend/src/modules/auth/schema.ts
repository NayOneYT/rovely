import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import {
  normalizePhoneNumber, valueOrNull,
  codeSchema, nameWithDefaultSchema, emailSchema, phoneSchema, tokenSchema
} from "@/shared/schemas/index.js"

const identifierSchema = z
  .string()
  .min(4)
  .max(254)
  .toLowerCase()
  .refine((value) => {
    const isLogin = /^[a-zа-яё0-9._-]+$/.test(value)
    const isEmail = z.string().email().safeParse(value).success
    const isPhone = parsePhoneNumberFromString(value)?.isValid()
    return isEmail || isLogin || isPhone
  }, "Invalid format")
  .transform(normalizePhoneNumber)

const rememberMeSchema = z
  .boolean()

const passwordSchema = z
  .string()
  .min(6)
  .max(72)
  .regex(/^[^\p{Extended_Pictographic}]+$/u)

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

export const sendLoginWithPhoneSchema = z.object({
  phone: phoneSchema,
})

export const checkAvailabilitySchema = z.object({
  field: z
    .enum(["username", "email", "phone", "login"], { message: "Invalid field" }),
  value: z
    .string()
    .min(1)
    .max(254)
    .toLowerCase()
    .transform(normalizePhoneNumber)
})

export const registerSchema = z.object({
  name: nameWithDefaultSchema,
  username: z
    .string()
    .max(30)
    .regex(/^[a-zA-Z0-9]+$/)
    .optional(),
  email: valueOrNull(emailSchema),
  phone: valueOrNull(phoneSchema),
  login: z
    .string()
    .min(4)
    .max(50)
    .toLowerCase()
    .regex(/^[a-zа-яё0-9._-]+$/),
  password: passwordSchema
}).superRefine((data, ctx) => {
  if (!data.email && !data.phone) {
    ctx.addIssue({
      code: "custom",
      message: "Enter your email or phone number",
      path: ["email"]
    })
    ctx.addIssue({
      code: "custom",
      message: "Enter your email or phone number",
      path: ["phone"]
    })
  }
})

export const googleAuthSchema = z.object({
  code: z
    .string()
    .min(40)
    .max(250)
    .regex(/^4\/[0-9A-Za-z_-]+$/)
})

export const passwordRecoveryContactsSchema = z.object({
  identifier: identifierSchema,
})

export const sendPasswordRecoverySchema = z.object({
  identifier: identifierSchema,
  to: z
    .enum(["EMAIL", "PHONE"])
})

export const checkPasswordRecoveryToken = z.object({
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
export type GoogleAuthDto = z.infer<typeof googleAuthSchema>
export type PasswordRecoveryContactsDto = z.infer<typeof passwordRecoveryContactsSchema>
export type SendPasswordRecoveryDto = z.infer<typeof sendPasswordRecoverySchema>
export type CheckPasswordRecoveryTokenDto = z.infer<typeof checkPasswordRecoveryToken>
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>