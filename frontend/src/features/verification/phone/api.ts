import axios from "@/lib/axios"
import type { SendVerificationCodeDto, VerifyPhoneDto } from "./schema"

export default {
  verify: async (data: VerifyPhoneDto) => {
    const response = await axios.post("/api/verification/phone/verify", data)
    return response.data
  },
  checkRegistrationVerification: async (phone: string) => {
    const response = await axios.get("/api/verification/phone/check", {
      params: {
        phone
      }
    })
    return response.data
  },
  sendVerificationCode: async (data: SendVerificationCodeDto) => {
    const response = await axios.post("/api/verification/phone/send", data)
    return response.data
  }
}