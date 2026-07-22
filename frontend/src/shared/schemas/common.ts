import { z } from "zod"

export const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) => {
  return z
    .preprocess(
      (value) => value === "" ? undefined : value,
      schema
    )
}