import { AppError, ErrorCode } from "@/types/index.js"
import jwt from "jsonwebtoken"
import { config } from "@/config/index.js"
import type { Request, Response, NextFunction } from "express"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken
    if (!token) throw new AppError(401, ErrorCode.UNAUTHORIZED)
    const payload = jwt.verify(token, config.jwtAccessSecret) as { id: string }
    req.accountId = payload.id
    next()
  } catch (error) {
    if (error instanceof AppError) next(error)
    else if (error instanceof jwt.TokenExpiredError) next(new AppError(401, ErrorCode.TOKEN_EXPIRED))
    else next(new AppError(401, ErrorCode.TOKEN_INVALID))
  }
}