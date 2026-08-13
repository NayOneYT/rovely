export type SendLoginWithPhoneResult = {
  timeLeftMs: number
}

export type GetPasswordRecoveryContactsResult = {
  email?: string
  phone?: string
}

export type SendPasswordRecoveryResult = {
  to: "EMAIL" | "PHONE"
  timeLeftMs: number
}

export type ResetPasswordStatus = "CHECKING" | "TOKEN_INVALID" | "READY" | "RESETTING" | "SUCCESS"

export type CheckAvailabilityResult = "AVAILABLE" | "TAKEN" | "ERROR"

export type MeDto = {
  profile: {
    username: string
  }
}