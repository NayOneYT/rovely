import type { Ref } from "vue"

export type useEmailVerificationOptions = {
  nameValue: Ref<string>
  emailValue: Ref<string>
  cooldowns: Ref<Record<string, number>>
  isProcessing: Ref<boolean>
}

export type SendResponse = {
  timeLeftMs: number
}

export type CheckRegistrationStatus = "VALIDATION_ERROR" | "VERIFIED" | "NOT_VERIFIED"
export type SendStatus = "VALIDATION_ERROR" | "SUCCESS" | "ALREADY_VERIFIED" | "ERROR"
export type VerifyStatus = "IDLE" | "TOKEN_INVALID" | "SUCCESS" | "ALREADY_VERIFIED"