import axios from "axios"
import { ApiError } from "./errors"
import { ErrorCode } from "@shared/error-code.enums"
import { queryClient } from "./query.client"
import { router } from "@/router"
import { toast } from "vue-sonner"
import { formatMsToMMSS } from "../utils"

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const data = error.response?.data
    if (data.code) {
      if (data.code === ErrorCode.ACCESS_TOKEN_EXPIRED) {
        const originalRequest = error.config
        try {
          await api.post("/auth/refresh")
          return api(originalRequest)
        } catch {
          queryClient.clear()
          router.replace("/")
          return Promise.reject(error)
        }
      }
      if (data.code === ErrorCode.RATE_LIMIT_EXCEEDED) {
        toast.error(`Слишком много запросов, повторите через ${formatMsToMMSS(data.timeBeforeMs)}`)
      }
      throw new ApiError(data)
    }
    throw error
  }
)