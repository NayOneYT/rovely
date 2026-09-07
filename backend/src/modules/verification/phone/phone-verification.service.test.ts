describe("phoneVerificationService", () => {
  describe("verify", () => {
    it.todo("throws PHONE_VERIFICATION_REQUEST_NOT_FOUND for a non-existent phone and accountId combination")
    it.todo("throws PHONE_ALREADY_VERIFIED when the phone is already verified")
    it.todo("throws PHONE_VERIFICATION_CODE_INVALID for an incorrect code")
    it.todo("sets isConfirmed to true when accountId isn't provided and updates its data in Redis")
    it.todo("updates phone for the provided accountId and deletes its data from Redis")
  })

  describe("checkRegistration", () => {
    it.todo("throws PHONE_VERIFICATION_REQUEST_NOT_FOUND for a non-existent phone")
    it.todo("throws PHONE_NOT_VERIFIED when the phone isn't verified")
  })

  describe("send", () => {
    it.todo("throws PHONE_TAKEN for an existing phone")
    it.todo("throws TELEGRAM_LINK_NOT_FOUND for a non-existent telegramLink")
    it.todo("throws SEND_TELEGRAM_MESSAGE_COOLDOWN with timeLeftMs when resending too soon")
    it.todo("throws PHONE_ALREADY_VERIFIED when the phone is already verified")
    it.todo("converts a GrammyError with code 403 to TELEGRAM_BOT_BLOCKED")
    it.todo("creates a new request and stores accountId in Redis and returns timeLeftMs on success")
  })
})