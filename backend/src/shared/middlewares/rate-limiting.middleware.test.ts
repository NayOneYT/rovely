describe("rateLimitingMiddleware", () => {
  it.todo("uses accountId as the identifier for Redis key when it's set")
  it.todo("uses the IP as the identifier for Redis key when accountId isn't set")
  it.todo("uses a default windowMs of 1 minute when it's not provided")
  it.todo("creates a new record in Redis when the limit isn't exceeded and calls the next function")
  it.todo("allows a request again after the window has passed")
  it.todo("sets Retry-After and throws RATE_LIMIT_EXCEEDED with timeLeftMs when the limit is exceeded")
})