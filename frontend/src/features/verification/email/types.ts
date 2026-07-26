export type SendResult = {
  timeLeftMs: number
}
export type CheckRegistrationStatus = "VALIDATION_ERROR" | "VERIFIED" | "NOT_VERIFIED"
export type SendStatus = "VALIDATION_ERROR" | "SUCCESS" | "ALREADY_VERIFIED" | "ERROR"
export type VerifyStatus = "TOKEN_INVALID" | "SUCCESS" | "ALREADY_VERIFIED"