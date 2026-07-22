import axios from "axios"
import { ApiError, ErrorCode } from "./types"

export const api = axios.create({
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
          await api.post("/api/auth/refresh")
          return api(originalRequest)
        } catch {
          window.location.href = "/"
          return
        }
      }
      throw new ApiError(data)
    }
    throw error
  }
)