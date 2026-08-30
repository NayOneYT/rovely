import type { SendDto } from "./email-verification.schemas.js"

export type SendParams = SendDto & {
  accountId: string | undefined
}

export type EmailVerificationTokenPayload = {
  email: string
  accountId: string | undefined
  isConfirmed: boolean
}