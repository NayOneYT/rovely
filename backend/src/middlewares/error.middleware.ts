import type { Request, Response, NextFunction } from "express"

export class AppError extends Error {
  constructor(public statusCode: number, public errors: Record<string, string>) {
    super()
  }
}

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ errors: error.errors })
    return
  }
  console.error(error.stack)
  res.status(500).json({ message: "Произошла ошибка сервера, попробуйте позже" })
}