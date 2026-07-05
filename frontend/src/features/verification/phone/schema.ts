import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { removeEmptyValues } from "@/utils/removeEmptyValues"

export const verifyPhoneSchema = z.object({
  phone: z
    .string({ required_error: "Обязательное поле" })
    .transform((value) => parsePhoneNumberFromString(value))
    .refine((value) => value?.isValid(), "Неверный формат")
    .transform((value) => value?.number as string),
  code: z
    .string({ required_error: "Введите код" })
    .min(1, "Введите код")
    .length(6, "Код должен содержать ровно 6 символов")
    .regex(/^\d+$/, "Неверный формат"),
  accountId: z
    .union([
      z.literal("none"),
      z.string().cuid()
    ], {
      invalid_type_error: "Неверный формат"
    })
    .optional()
})

export const sendVerificationCodeSchema = z.object({
  phone: z
    .string({ required_error: "Обязательное поле" })
    .transform((value) => parsePhoneNumberFromString(value))
    .refine((value) => value?.isValid(), "Неверный формат")
    .transform((value) => value?.number as string),
  name: removeEmptyValues.pipe(z
    .string()
    .optional()),
  accountId: z
    .union([
      z.literal("none"),
      z.string().cuid()
    ], {
      invalid_type_error: "Неверный формат"
    })
    .optional()
})

export type VerifyPhoneDto = z.infer<typeof verifyPhoneSchema>
export type SendVerificationCodeDto = z.infer<typeof sendVerificationCodeSchema>