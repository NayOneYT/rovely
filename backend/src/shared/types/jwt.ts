import { AccountRole } from "@/generated/prisma/enums.js"

export type AccessTokenPayload = {
  id: string
  role: AccountRole
}

export type RefreshTokenPayload = {
  id: string
  rememberMe: boolean
  passwordChangedAt: number
}