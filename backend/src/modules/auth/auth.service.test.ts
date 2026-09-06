describe("authService", () => {
  describe("refresh", () => {
    it.todo("throws REFRESH_TOKEN_EXPIRED when the refresh token is expired")
    it.todo("throws REFRESH_TOKEN_INVALID for an incorrect refresh token")
    it.todo("throws ACCOUNT_NOT_FOUND for a non-existent ID")
    it.todo("throws REFRESH_TOKEN_INVALID when the password has been changed")
    it.todo("returns new auth tokens and rememberMe on success")
  })

  describe("login", () => {
    it.todo("throws ACCOUNT_NOT_FOUND for a non-existent identifier")
    it.todo("throws PASSWORD_NOT_SET when the account has no password")
    it.todo("throws PASSWORD_INVALID for an incorrect password")
    it.todo("returns auth tokens on success")
  })

  describe("sendLoginWithPhone", () => {
    it.todo("throws ACCOUNT_NOT_FOUND for a non-existent phone")
    it.todo("throws SEND_TELEGRAM_MESSAGE_COOLDOWN with timeLeftMs when resending too soon")
    it.todo("converts a GrammyError with code 403 to TELEGRAM_BOT_BLOCKED")
    it.todo("creates a new record in Redis and returns timeLeftMs on success")
  })

  describe("loginWithPhone", () => {
    it.todo("throws ACCOUNT_NOT_FOUND for a non-existent phone")
    it.todo("throws LOGIN_WITH_PHONE_REQUEST_NOT_FOUND when there is no request for this phone")
    it.todo("throws LOGIN_WITH_PHONE_CODE_INVALID for an incorrect code")
    it.todo("deletes the code from Redis and returns auth tokens on success")
  })

  describe("checkAvailability", () => {
    it.todo("throws USERNAME_TAKEN for an existing username")
    it.todo("throws EMAIL_TAKEN for an existing email")
    it.todo("throws PHONE_TAKEN for an existing phone")
    it.todo("throws LOGIN_TAKEN for an existing login")
  })

  describe("register", () => {
    it.todo("throws USERNAME_TAKEN for an existing username")
    it.todo("throws EMAIL_TAKEN for an existing email")
    it.todo("throws PHONE_TAKEN for an existing phone")
    it.todo("throws LOGIN_TAKEN for an existing login")
    it.todo("throws EMAIL_NOT_VERIFIED when the email verification check fails")
    it.todo("throws PHONE_NOT_VERIFIED when the phone verification check fails")
    it.todo("creates an account in the DB and deletes the verification data from Redis on success")
  })

  describe("google", () => {
    it.todo("throws GOOGLE_AUTH_FAILED for an incorrect code")
    it.todo("creates an account for this email and deletes its verification data from Redis")
    it.todo("links the Google ID to an existing email")
    it.todo("returns auth tokens and the isNewAccount flag on success")
  })

  describe("getPasswordRecoveryContacts", () => {
    it.todo("throws ACCOUNT_NOT_FOUND for a non-existent identifier")
    it.todo("returns a blurred email when linked")
    it.todo("returns a blurred phone when linked")
  })

  describe("sendPasswordRecovery", () => {
    it.todo("throws ACCOUNT_NOT_FOUND for a non-existent identifier")
    it.todo("throws EMAIL_NOT_LINKED when an email isn't linked")
    it.todo("throws PHONE_NOT_LINKED when a phone isn't linked")
    it.todo("throws SEND_EMAIL_COOLDOWN when resending to the email too soon")
    it.todo("throws SEND_TELEGRAM_MESSAGE_COOLDOWN when resending to the phone too soon")
    it.todo("deletes the old request from Redis for an existing token")
    it.todo("converts a GrammyError with code 403 to TELEGRAM_BOT_BLOCKED")
    it.todo("creates a new request and token in Redis and returns timeLeftMs on success")
  })

  describe("checkPasswordRecoveryToken", () => {
    it.todo("throws PASSWORD_RECOVERY_REQUEST_NOT_FOUND for a non-existent token")
    it.todo("returns accountId, request and timeLeftMs")
  })

  describe("resetPassword", () => {
    it.todo("throws PASSWORD_RECOVERY_REQUEST_NOT_FOUND for a non-existent token")
    it.todo("updates password and passwordChangedAt in the DB and deletes password recovery data from Redis on success")
  })

  describe("me", () => {
    it.todo("throws UNAUTHORIZED for a non-existent ID")
    it.todo("returns the account on success")
  })
})

describe("generateUniqueUsername", () => {
  it.todo("retries when the generated username is already taken in the DB")
  it.todo("skips the DB check when the generator repeats an already-known-taken username")
  it.todo("truncates a username with more than 30 characters")
  it.todo("preserves the 3-digit suffix when truncating")
  it.todo("doesn't truncate a username with 30 or fewer characters")
  it.todo("throws USERNAME_GENERATION_ERROR after 20 unsuccessful attempts")
  it.todo("returns a username derived from the email when it's provided")
  it.todo("returns a generated username when no email is provided")
})