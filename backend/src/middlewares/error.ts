import { AppError } from "@/types/index.js"
import type { Request, Response, NextFunction } from "express"

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.data)
    return
  }
  console.error(error.stack)
  res.status(500).json({ message: "Произошла ошибка сервера, попробуйте позже" })
}