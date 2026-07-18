import { AppError, ErrorCode } from "@/types/index.js"
import type { Request, Response, NextFunction } from "express"
import type { ZodSchema } from "zod"

type ValidateTarget = "body" | "params" | "query"

export const validate = (schema: ZodSchema, target: ValidateTarget) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      const rawFieldErrors = result.error.flatten().fieldErrors
      const fieldErrors = Object.fromEntries(
        Object.entries(rawFieldErrors).map(([key, value]) => [key, value![0]])
      ) as Record<string, string>
      throw new AppError(ErrorCode.VALIDATION_ERROR, { fieldErrors })
    }
    if (target === "body") {
      req.body = result.data
    } else {
      Object.defineProperty(req, target, {
        value: { ...result.data },
        writable: true,
        configurable: true
      })
    }
    next()
  }
}