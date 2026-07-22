import type { ErrorCode } from "./error-codes"

export type ErrorResponseData = {
  code: ErrorCode
  fieldErrors?: Record<string, string>
  [key: string]: any
}