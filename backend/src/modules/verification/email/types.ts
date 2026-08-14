import type { SendDto } from "./schema.js"

export type SendParams = SendDto & {
  accountId: string | null
}