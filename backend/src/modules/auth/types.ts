export type ContactsDto = {
  email?: string
  phone?: string
}

export type SendPasswordRecoveryResultDto = {
  statusCode: number
  type: "success" | "info"
  message: string
  to: "EMAIL" | "PHONE"
  secondsLeft: number
}