import type { ErrorCode } from "./error-codes"
import type { ErrorResponseData } from "./error-response"

export class ApiError extends Error {
  public readonly code: ErrorCode
  [key: string]: any

  constructor(public data: ErrorResponseData) {
    super()
    this.name = "ApiError"
    const { code, fieldErrors, ...other } = data
    this.code = code
    Object.assign(this, other)
  }
}