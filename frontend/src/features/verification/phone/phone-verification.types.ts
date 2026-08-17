import type { Ref } from "vue"

export type usePhoneVerificationOptions = {
  nameValue: Ref<string>
  phoneValue: Ref<string>
  codeValue: Ref<string>
  cooldowns: Ref<Record<string, number>>
  isProcessing: Ref<boolean>
}

export type SendResponse = {
  timeLeftMs: number
}

export type VerifyStatus = "VALIDATION_ERROR" | "SUCCESS" | "ERROR"
export type CheckRegistrationStatus = "VALIDATION_ERROR" | "VERIFIED" | "NOT_VERIFIED"
export type SendStatus = "VALIDATION_ERROR" | "SUCCESS" | "ALREADY_VERIFIED" | "ERROR"