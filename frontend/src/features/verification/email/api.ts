import axios from "@/shared/lib/axios"
import type { SendVerificationEmailDto } from "./schema"

export default {
  verify: async (token: string) => {
    const response = await axios.get(`/api/verification/email/verify/${token}`)
    return response.data
  },
  checkRegistrationVerification: async (email: string) => {
    const response = await axios.get("/api/verification/email/check", {
      params: {
        email
      }
    })
    return response.data
  },
  sendVerificationEmail: async (data: SendVerificationEmailDto) => {
    const response = await axios.post("/api/verification/email/send", data)
    return response.data
  },
}