import { api } from "@/shared/api/client"
import type { VerifyDto, CheckRegistrationDto, SendDto } from "./schema"
import type { SendResult } from "./types"

export const emailVerificationApi = {
  verify: async (data: VerifyDto) => {
    await api.post(`/verification/email/verify/${data.token}`)
  },

  checkRegistration: async (data: CheckRegistrationDto) => {
    await api.post("/verification/email/check", data)
  },

  send: async (data: SendDto) => {
    const response = await api.post("/verification/email/send", data)
    return response.data as SendResult
  },
}