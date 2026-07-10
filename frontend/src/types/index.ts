export type ResponseErrorDto = {
  message?: string
  errors?: Record<string, string>
}

export type ResponseMessageDto = {
  type: "success" | "info" | "warning" | "error"
  message: string
  secondsLeft?: number
}