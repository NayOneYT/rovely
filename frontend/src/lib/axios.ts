import axios from "axios"
import router from "@/router"

const instance = axios.create({
  withCredentials: true
})

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
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