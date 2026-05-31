import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(4, "Минимум 4 символа")
    .trim()
    .max(254, "Максимум 254 символа")
    .toLowerCase()
    .refine((value) => {
      const isEmail = z.string().email().safeParse(value).success
      const isLogin = /^[a-zа-яё0-9._-]+$/.test(value)
      return isEmail || isLogin
    }, "Неверный формат"),
  password: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(6, "Минимум 6 символов")
    .max(72, "Максимум 72 символа")
    .regex(/^[^\p{Extended_Pictographic}]+$/u, "Недопустимые символы"),
  rememberMe: z
    .boolean()
    .default(false)
})

export const loginWithPhoneSchema = z.object({
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
  rememberMe: z
    .boolean()
    .default(false)
})

export const sendLoginWithPhoneCodeSchema = z.object({
  phone: z
    .string({ required_error: "Обязательное поле" })
    .transform((value) => parsePhoneNumberFromString(value))
    .refine((value) => value?.isValid(), "Неверный формат")
    .transform((value) => value?.number as string),
})

export const checkSchema = z.object({
  field: z
    .enum(["username", "email", "phone", "login"], { message: "Недопустимое поле для проверки" }),
  value: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .max(254, "Максимум 254 символа")
})

export const registerSchema = z.object({
  name: z
    .string()
    .max(30, "Максимум 30 символов")
    .default("Некто"),
  username: z
    .string()
    .max(30, "Максимум 30 символов")
    .regex(/^[a-zA-Z0-9]+$/, "Только латиница и цифры")
    .optional(),
  email: z
    .string()
    .trim()
    .email("Неверный формат")
    .nullish()
    .transform((value) => value ? value : null),
  phone: z
    .string()
    .nullish()
    .transform((value) => value ? parsePhoneNumberFromString(value) : null)
    .refine((value) => value?.isValid() || value === null, "Неверный формат")
    .transform((value) => value ? value?.number as string : null),
  login: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(4, "Минимум 4 символа")
    .max(50, "Максимум 50 символов")
    .toLowerCase()
    .regex(/^[a-zа-яё0-9._-]+$/, "Только латиница, кирилица, цифры и ._-"),
  password: z
    .string({ required_error: "Обязательное поле" })
    .min(1, "Обязательное поле")
    .min(6, "Минимум 6 символов")
    .max(72, "Максимум 72 символа")
    .regex(/^[^\p{Extended_Pictographic}]+$/u, "Недопустимые символы")
}).superRefine((data, ctx) => {
  if (!data.email && !data.phone) {
    ctx.addIssue({
      code: "custom",
      message: "Укажите email или номер телефона",
      path: ["email"]
    })
    ctx.addIssue({
      code: "custom",
      message: "Укажите email или номер телефона",
      path: ["phone"]
    })
  }
})

export type LoginDto = z.infer<typeof loginSchema>
export type LoginWithPhoneDto = z.infer<typeof loginWithPhoneSchema>
export type SendLoginWithPhoneCodeDto = z.infer<typeof sendLoginWithPhoneCodeSchema>
export type CheckDto = z.infer<typeof checkSchema>
export type RegisterDto = z.infer<typeof registerSchema>