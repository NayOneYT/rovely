import { ErrorCode } from "@shared/error-code.enums"

export type ErrorResponse = {
  code: ErrorCode
  fieldErrors?: Record<string, string>
  [key: string]: any
}