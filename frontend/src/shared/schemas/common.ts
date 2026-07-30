import { z } from "zod"

export const makeOptional = <T extends z.ZodTypeAny>(schema: T) => {
  return z.preprocess(
    (value) => value === "" ? undefined : value,
    schema.optional()
  )
}