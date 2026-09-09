describe("authMiddleware", () => {
  it.todo("calls next with UNAUTHORIZED when accessToken isn't set in the cookies")
  it.todo("calls next with ACCESS_TOKEN_EXPIRED when accessToken is expired")
  it.todo("calls next with ACCESS_TOKEN_INVALID for an incorrect accessToken")
  it.todo("saves accountId to the request and calls the next function")
})

describe("optionalAuthMiddleware", () => {
  it.todo("calls next with ACCESS_TOKEN_EXPIRED when accessToken is expired")
  it.todo("calls next with ACCESS_TOKEN_INVALID for an incorrect accessToken")
  it.todo("saves accountId to the request when it's provided and calls the next function")
  it.todo("calls the next function when accessToken doesn't exist")
})

describe("handleError", () => {
  it.todo("converts jwt.TokenExpiredError to ACCESS_TOKEN_EXPIRED")
  it.todo("converts jwt.JsonWebTokenError to ACCESS_TOKEN_INVALID")
  it.todo("calls the next function with any other error")
})