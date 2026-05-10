import type { Request, Response, NextFunction } from "express"

export class AppError extends Error {
  constructor(public statusCode: number = 500, public errors: Record<string, string[]>) {
    super()
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ errors: err.errors })
    return
  }
  console.error(err.stack)
  res.status(500).json({ message: "Произошла ошибка сервера, попробуйте позже" })
}