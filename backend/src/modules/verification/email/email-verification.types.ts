import type { SendDto } from "./email-verification.schemas.js"

export type SendParams = SendDto & {
  accountId: string | null
}