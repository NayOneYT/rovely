import { api } from "@/shared/api"
import type { VerifyDto, CheckRegistrationDto, SendDto } from "./email-verification.schemas"
import type { SendResponse } from "./email-verification.types"

export const emailVerificationApi = {
  verify: async (data: VerifyDto) => {
    await api.post(`/verification/email/verify/${data.token}`)
  },

  checkRegistration: async (data: CheckRegistrationDto) => {
    await api.post("/verification/email/check", data)
  },

  send: async (data: SendDto) => {
    const response = await api.post<SendResponse>("/verification/email/send", data)
    return response.data
  },
}