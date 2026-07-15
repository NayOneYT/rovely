import { ErrorCode } from "./index.js"

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