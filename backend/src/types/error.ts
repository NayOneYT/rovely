export enum ErrorCode {
  INTERNAL_ERROR = "INTERNAL_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID"
}

type AppErrorData = {
  fieldErrors?: Record<string, string>
  [key: string]: any
}

export class AppError extends Error {
  constructor(public statusCode: number, public errorCode: ErrorCode, public data?: AppErrorData) {
    super()
    this.name = "AppError"
  }
}