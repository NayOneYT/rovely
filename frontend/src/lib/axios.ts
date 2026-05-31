import axios from "axios"
import router from "@/router"

const instance = axios.create({
  withCredentials: true
})

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (originalRequest.url.includes("/auth/refresh") || originalRequest.url.includes("/auth/me") || originalRequest.url.includes("/auth/login")) {
      throw error
    }
    if (error.response?.status === 401) {
      try {
        await instance.post("/api/auth/refresh")
        return instance(originalRequest)
      } catch {
        router.push("/")
      }
    }
    throw error
  }
)

export default instance