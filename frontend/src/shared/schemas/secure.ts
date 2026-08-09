import { z } from "zod"

export const codeSchema = z
  .string({ required_error: "Обязательное поле" })
  .min(1, "Обязательное поле")
  .regex(/^\d+$/, "Неверный формат")
  .length(6, "Код должен содержать ровно 6 символов")

export const tokenSchema = z
  .string()
  .length(64)
  .regex(/^[a-f0-9]{64}$/)