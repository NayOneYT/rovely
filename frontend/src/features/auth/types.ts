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

export type MeDto = {
  profile: {
    username: string
  }
}