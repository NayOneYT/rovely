import { ErrorCode } from "@shared/error-code.enums"
import type { ErrorResponse } from "./error-response.types"

export class ApiError extends Error {
  public readonly code: ErrorCode
  [key: string]: any

  constructor(public data: ErrorResponse) {
    super()
    this.name = "ApiError"
    const { code, fieldErrors, ...other } = data
    this.code = code
    Object.assign(this, other)
  }
}