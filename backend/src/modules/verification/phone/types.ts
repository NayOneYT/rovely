import type { VerifyDto, SendDto } from "./schema.js"

export type VerifyParams = VerifyDto & {
  accountId: string | null
}

export type SendParams = SendDto & {
  accountId: string | null
}