import { generateSecureToken } from "./token.util.js"

describe("generateSecureToken", () => {
  it("returns a 64-character hex string", () => {
    const token = generateSecureToken()
    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })
})