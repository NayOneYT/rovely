export interface MeDto {
  profile: {
    username: string
  }
}

export interface SendPasswordRecoveryResponseErrorDataDto {
  errors?: Record<string, string>,
  type: "info",
  message: string,
  to: "EMAIL" | "PHONE",
  secondsLeft: number
}