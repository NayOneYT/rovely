import { api } from "@/shared/api"
import type { MeResponse } from "./account.types"

export const accountApi = {
  me: async () => {
    const response = await api.get<MeResponse>("/auth/me")
    return response.data
  }
}