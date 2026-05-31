import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export const verifyPhoneSchema = z.object({
  phone: z
    .string({ required_error: "Обязательное поле" })
    .transform((value) => parsePhoneNumberFromString(value))
    .refine((value) => value?.isValid(), "Неверный формат")
    .transform((value) => value?.number as string),
  code: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .length(6, "Код должен содержать ровно 6 символов")
    .regex(/^\d+$/, "Неверный формат"),
  accountId: z
    .union([
      z.literal("none"),
      z.string().cuid()
    ], {
      invalid_type_error: "Неверный формат"
    })
    .default("none")
})

export const checkRegistrationPhoneVerificationSchema = z.object({
  phone: z
    .string({ required_error: "Обязательное поле" })
    .transform((value) => parsePhoneNumberFromString(value))
    .refine((value) => value?.isValid(), "Неверный формат")
})

export const sendVerificationCodeSchema = z.object({
  phone: z
    .string({ required_error: "Обязательное поле" })
    .transform((value) => parsePhoneNumberFromString(value))
    .refine((value) => value?.isValid(), "Неверный формат")
    .transform((value) => value?.number as string),
  name: z
    .string()
    .max(30, "Максимум 30 символов")
    .default("Некто"),
  accountId: z
    .union([
      z.literal("none"),
      z.string().cuid()
    ], {
      invalid_type_error: "Неверный формат"
    })
    .default("none")
})

export type SendVerificationCodeDto = z.infer<typeof sendVerificationCodeSchema>
export type VerifyPhoneDto = z.infer<typeof verifyPhoneSchema>