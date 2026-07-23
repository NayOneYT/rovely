import { api } from "@/shared/api/client"
import type { VerifyDto, CheckRegistrationDto, SendDto } from "./schema"
import type { SendResult } from "./types"

export const phoneVerificationApi = {
  verify: async (data: VerifyDto) => {
    await api.post("/verification/phone/verify", data)
  },

  checkRegistration: async (data: CheckRegistrationDto) => {
    await api.post("/verification/phone/check", data)
  },

  send: async (data: SendDto) => {
    const response = await api.post("/verification/phone/send", data)
    return response.data as SendResult
  }
}