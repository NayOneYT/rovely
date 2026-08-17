import type { VerifyDto, SendDto } from "./phone-verification.schemas.js"

export type VerifyParams = VerifyDto & {
  accountId: string | null
}

export type SendParams = SendDto & {
  accountId: string | null
}