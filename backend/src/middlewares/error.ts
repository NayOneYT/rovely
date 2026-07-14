import { AppError, ErrorCode } from "@/types/index.js"
import type { Request, Response, NextFunction } from "express"

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ сode: error.errorCode, ...error.data })
    return
  }
  console.error(error.stack)
  res.status(500).json({ сode: ErrorCode.INTERNAL_ERROR })
}