export type RegistrationStep = 1 | 2 | 2.5 | 3
export type PasswordRecoveryStep = 1 | 2

export type SendLoginWithPhoneResponse = {
  timeLeftMs: number
}

export type GetPasswordRecoveryContactsResponse = {
  email?: string
  phone?: string
}

export type SendPasswordRecoveryResponse = {
  timeLeftMs: number
}

export type CheckPasswordRecoveryTokenResponse = {
  timeLeftMs: number
}

export type ResetPasswordStatus = "CHECKING" | "TOKEN_INVALID" | "READY" | "RESETTING" | "SUCCESS"

export type CheckAvailabilityResult = "AVAILABLE" | "TAKEN" | "ERROR"