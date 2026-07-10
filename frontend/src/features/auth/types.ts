export type MeDto = {
  profile: {
    username: string
  }
}

export type SendPasswordRecoveryResponseErrorDataDto = {
  errors?: Record<string, string>
  type: "info"
  message: string
  to: "EMAIL" | "PHONE"
  secondsLeft: number
}