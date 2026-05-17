import { AppError } from "./error.middleware.js";
import jwt from "jsonwebtoken"
import { config } from "../config/index.js";
import type { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken
    if (!token) throw new AppError(401, {
      message: ["Не авторизован"]
    })
    const payload = jwt.verify(token, config.jwtAccessSecret) as { id: string }
    req.userId = payload.id
    next()
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
      return
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, {
        message: ["Токен истек"]
      }))
      return
    }
    next(new AppError(401, {
      message: ["Невалидный токен"]
    }))
  }
}