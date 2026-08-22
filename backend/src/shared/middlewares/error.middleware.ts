import { AppError } from "@/shared/errors/index.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import type { Request, Response, NextFunction } from "express"

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    const code = error.errorCode
    res.status(errorStatusMap[code]).json({ code, ...error.data })
    return
  }
  console.error(error.stack)
  res.status(500).json({ code: ErrorCode.INTERNAL_ERROR })
}

const errorStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.ACCESS_TOKEN_EXPIRED]: 401,
  [ErrorCode.ACCESS_TOKEN_INVALID]: 401,
  [ErrorCode.REFRESH_TOKEN_INVALID]: 401,
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: 401,
  [ErrorCode.USERNAME_GENERATION_ERROR]: 500,
  [ErrorCode.ACCOUNT_NOT_FOUND]: 404,
  [ErrorCode.PASSWORD_NOT_SET]: 422,
  [ErrorCode.PASSWORD_INVALID]: 401,
  [ErrorCode.LOGIN_WITH_PHONE_REQUEST_NOT_FOUND]: 404,
  [ErrorCode.LOGIN_WITH_PHONE_CODE_EXPIRED]: 410,
  [ErrorCode.LOGIN_WITH_PHONE_CODE_INVALID]: 422,
  [ErrorCode.TELEGRAM_LINK_NOT_FOUND]: 404,
  [ErrorCode.TELEGRAM_BOT_BLOCKED]: 403,
  [ErrorCode.USERNAME_TAKEN]: 409,
  [ErrorCode.EMAIL_TAKEN]: 409,
  [ErrorCode.PHONE_TAKEN]: 409,
  [ErrorCode.LOGIN_TAKEN]: 409,
  [ErrorCode.GOOGLE_AUTH_FAILED]: 422,
  [ErrorCode.EMAIL_NOT_LINKED]: 422,
  [ErrorCode.PHONE_NOT_LINKED]: 422,
  [ErrorCode.SEND_EMAIL_COOLDOWN]: 429,
  [ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN]: 429,
  [ErrorCode.PASSWORD_RECOVERY_TOKEN_EXPIRED]: 410,
  [ErrorCode.PASSWORD_RECOVERY_REQUEST_NOT_FOUND]: 404,
  [ErrorCode.EMAIL_VERIFICATION_REQUEST_NOT_FOUND]: 404,
  [ErrorCode.EMAIL_VERIFICATION_REQUEST_EXPIRED]: 410,
  [ErrorCode.EMAIL_ALREADY_VERIFIED]: 409,
  [ErrorCode.EMAIL_NOT_VERIFIED]: 403,
  [ErrorCode.EMAIL_VERIFICATION_EXPIRED]: 410,
  [ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND]: 404,
  [ErrorCode.PHONE_VERIFICATION_REQUEST_EXPIRED]: 410,
  [ErrorCode.PHONE_ALREADY_VERIFIED]: 409,
  [ErrorCode.PHONE_NOT_VERIFIED]: 403,
  [ErrorCode.PHONE_VERIFICATION_CODE_INVALID]: 422,
  [ErrorCode.PHONE_VERIFICATION_EXPIRED]: 410
}