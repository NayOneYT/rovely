import { generateSecureCode } from "./code.util.js"

describe("generateSecureCode", () => {
  it("returns a 6-character string containing only digits", () => {
    const code = generateSecureCode()
    expect(code).toHaveLength(6)
    expect(code).toMatch(/^\d{6}$/)
  })
})