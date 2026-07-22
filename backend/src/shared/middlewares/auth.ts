import { AppError, ErrorCode, type AccessTokenPayload } from "@/shared/types/index.js"
import jwt from "jsonwebtoken"
import { config } from "@/shared/config.js"
import type { Request, Response, NextFunction } from "express"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken
    if (!token) throw new AppError(ErrorCode.UNAUTHORIZED)
    const payload = jwt.verify(token, config.jwtAccessSecret) as AccessTokenPayload
    req.accountId = payload.id
    req.accountRole = payload.role
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) next(new AppError(ErrorCode.ACCESS_TOKEN_EXPIRED))
    else if (error instanceof jwt.JsonWebTokenError) next(new AppError(ErrorCode.ACCESS_TOKEN_INVALID))
    else next(error)
  }
}