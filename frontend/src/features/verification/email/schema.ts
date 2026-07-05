import { z } from "zod"
import { removeEmptyValues } from "@/utils/removeEmptyValues"

export const sendVerificationEmailSchema = z.object({
  name: removeEmptyValues.pipe(z
    .string()
    .optional()),
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
    .optional()
})

export type SendVerificationEmailDto = z.infer<typeof sendVerificationEmailSchema>