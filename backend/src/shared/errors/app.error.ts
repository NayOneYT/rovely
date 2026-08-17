import { ErrorCode } from "./error-code.enums.js"

export class AppError extends Error {
  constructor(public errorCode: ErrorCode, public data?: AppErrorData) {
    super()
    this.name = "AppError"
  }
}

type AppErrorData = {
  fieldErrors?: Record<string, string>
  [key: string]: any
}