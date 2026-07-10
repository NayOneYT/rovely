import { z } from "zod"

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .length(64, "Токен должен содержать ровно 64 символа")
    .regex(/^[a-f0-9]{64}$/, 'Неверный формат токена')
})

export const checkRegistrationEmailVerificationSchema = z.object({
  email: z
    .string({ required_error: "Обязательное поле" })
    .trim()
    .email("Неверный формат")
    .toLowerCase()
})

export const sendVerificationEmailSchema = z.object({
  name: z
    .string()
    .max(30, "Максимум 30 символов")
    .default("Некто"),
  email: z
    .string({ required_error: "Обязательное поле" })
    .trim()
    .email("Неверный формат"),
  accountId: z
    .union([
      z.literal("none"),
      z.string().cuid()
    ], {
      invalid_type_error: "Неверный формат"
    })
    .default("none")
})

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>
export type SendVerificationEmailDto = z.infer<typeof sendVerificationEmailSchema>