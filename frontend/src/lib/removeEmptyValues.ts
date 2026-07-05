import { z } from "zod"

export const removeEmptyValues = z.string().transform((value) => value === "" ? undefined : value).optional()