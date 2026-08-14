export type SendLoginWithPhoneResponse = {
  timeLeftMs: number
}

export type GetPasswordRecoveryContactsResponse = {
  email?: string
  phone?: string
}

export type SendPasswordRecoveryResponse = {
  to: "EMAIL" | "PHONE"
  timeLeftMs: number
}

export type ResetPasswordStatus = "CHECKING" | "TOKEN_INVALID" | "READY" | "RESETTING" | "SUCCESS"

export type CheckAvailabilityResult = "AVAILABLE" | "TAKEN" | "ERROR"