import { AppError } from "@/shared/app.error.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import jwt from "jsonwebtoken"
import { appConfig } from "@/shared/app.config.js"
import type { Request, Response, NextFunction } from "express"
import type { AccessTokenPayload } from "@/shared/types/index.js"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAuthenticated = authenticateRequest(req)
    if (!isAuthenticated) throw new AppError(ErrorCode.UNAUTHORIZED)
    next()
  } catch (error) {
    handleError(error, next)
  }
}

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    authenticateRequest(req)
    next()
  } catch (error) {
    handleError(error, next)
  }
}

const authenticateRequest = (req: Request) => {
  const token = req.cookies.accessToken
  if (!token) return false
  const payload = jwt.verify(token, appConfig.jwtAccessSecret) as AccessTokenPayload
  req.accountId = payload.id
  return true
}

const handleError = (error: unknown, next: NextFunction) => {
  if (error instanceof jwt.TokenExpiredError) return next(new AppError(ErrorCode.ACCESS_TOKEN_EXPIRED))
  if (error instanceof jwt.JsonWebTokenError) return next(new AppError(ErrorCode.ACCESS_TOKEN_INVALID))
  next(error)
}