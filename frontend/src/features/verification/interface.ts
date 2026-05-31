export interface VerifyResponseDto {
  type: string
  message: string
}

export interface CheckResponseDto {
  verified: boolean
}

export interface SendResponseDto {
  type: string
  message: string
  secondsLeft?: number
}