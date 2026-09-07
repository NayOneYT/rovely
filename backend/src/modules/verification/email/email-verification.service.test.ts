describe("emailVerificationService", () => {
  describe("verify", () => {
    it.todo("throws EMAIL_VERIFICATION_REQUEST_NOT_FOUND for a non-existent token")
    it.todo("updates email and lowercaseEmail for the provided accountId and deletes its data from Redis")
    it.todo("throws EMAIL_ALREADY_VERIFIED when the email is already verified")
    it.todo("sets isConfirmed to true when accountId isn't provided and updates its data in Redis")
  })

  describe("checkRegistration", () => {
    it.todo("throws EMAIL_VERIFICATION_REQUEST_NOT_FOUND for a non-existent email")
    it.todo("throws EMAIL_NOT_VERIFIED when the email isn't verified")
  })

  describe("send", () => {
    it.todo("throws EMAIL_TAKEN for an existing email")
    it.todo("throws EMAIL_ALREADY_VERIFIED when the email is already verified")
    it.todo("throws SEND_EMAIL_COOLDOWN with timeLeftMs when resending too soon")
    it.todo("deletes old data from Redis on success")
    it.todo("creates a new request and stores a new token in Redis and returns timeLeftMs on success")
  })
})