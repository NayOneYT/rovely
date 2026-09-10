import crypto from "crypto"

export const generateSecureCode = () => {
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += crypto.randomInt(10)
  }
  return code
}