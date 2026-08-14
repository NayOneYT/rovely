import axios from "axios"
import { ApiError, ErrorCode } from "./types"
import { queryClient } from "./queryClient"
import { router } from "@/router"

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
      throw new ApiError(data)
    }
    throw error
  }
)