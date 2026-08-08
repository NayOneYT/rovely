export type RegistrationStep = 1 | 2 | 2.5 | 3
export type PasswordRecoveryStep = 1 | 2

export type SendLoginWithPhoneResult = {
  timeLeftMs: number
}

export type SendLoginWithPhoneStatus = "VALIDATION_ERROR" | "SUCCESS" | "ERROR"

export type GetPasswordRecoveryContactsResult = {
  email?: string
  phone?: string
}

export type SendPasswordRecoveryResult = {
  to: "EMAIL" | "PHONE"
  timeLeftMs: number
}

export type SendPasswordRecoveryStatus = "SUCCESS" | "ERROR"
export type ResetPasswordStatus = "CHECKING" | "TOKEN_INVALID" | "READY" | "RESETTING" | "SUCCESS"

export type MeDto = {
  profile: {
    username: string
  }
}