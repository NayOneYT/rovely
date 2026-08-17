export type AccessTokenPayload = {
  id: string
}

export type RefreshTokenPayload = {
  id: string
  rememberMe: boolean
  passwordChangedAt: number
}