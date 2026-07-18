import { AppError, ErrorCode, errorStatusMap } from "@/types/index.js"
import type { Request, Response, NextFunction } from "express"

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    const code = error.errorCode
    res.status(errorStatusMap[code]).json({ code, ...error.data })
    return
  }
  console.error(error.stack)
  res.status(500).json({ сode: ErrorCode.INTERNAL_ERROR })
}