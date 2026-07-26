export type SendResult = {
  timeLeftMs: number
}
export type VerifyStatus = "VALIDATION_ERROR" | "SUCCESS" | "ERROR"
export type CheckRegistrationStatus = "VALIDATION_ERROR" | "VERIFIED" | "NOT_VERIFIED"
export type SendStatus = "VALIDATION_ERROR" | "SUCCESS" | "ALREADY_VERIFIED" | "ERROR"