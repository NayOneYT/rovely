import { AccountRole } from "@/generated/prisma/enums.ts"

declare global {
  namespace Express {
    interface Request {
      accountId?: string
      accountRole?: AccountRole
    }
  }
}