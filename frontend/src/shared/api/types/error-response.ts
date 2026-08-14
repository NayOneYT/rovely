import type { ErrorCode } from "./error-codes"

export type ErrorResponse = {
  code: ErrorCode
  fieldErrors?: Record<string, string>
  [key: string]: any
}