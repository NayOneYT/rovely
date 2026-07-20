import { z } from "zod"

export const valueOrNull = <T extends z.ZodTypeAny>(schema: T) => {
  return schema
    .nullish()
    .transform((value) => value ?? null)
}