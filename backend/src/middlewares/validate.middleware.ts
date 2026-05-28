import type { Request, Response, NextFunction } from "express"
import type { ZodSchema } from "zod"

type ValidateTarget = "body" | "params" | "query"

export const validate = (schema: ZodSchema, target: ValidateTarget) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors })
      return
    }
    if (target === "body") req[target] = result.data
    next()
  }
}