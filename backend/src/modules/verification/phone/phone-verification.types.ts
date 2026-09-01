import type { VerifyDto, SendDto } from "./phone-verification.schemas.js"

export type VerifyParams = VerifyDto & {
  accountId: string | undefined
}

export type SendParams = SendDto & {
  accountId: string | undefined
}

export type PhoneVerificationRequestPayload = {
  code: string,
  isConfirmed: boolean
}