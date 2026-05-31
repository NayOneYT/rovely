import { z } from "zod"

export const discardEmpty = z.string().transform((value) => value === "" ? undefined : value).optional()