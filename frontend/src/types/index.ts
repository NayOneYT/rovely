export interface ResponseErrorDto {
  message?: string
  errors?: Record<string, string>
}

export interface ResponseMessageDto {
  type: "success" | "info" | "warning" | "error"
  message: string
  secondsLeft?: number
}