export type PasswordRecoveryTarget =
  | { to: "EMAIL", email: string }
  | { to: "PHONE", telegramUserId: number }

export type ContactsDto = {
  email?: string
  phone?: string
}

export type PasswordRecoveryTokenPayload = {
  accountId: string
}