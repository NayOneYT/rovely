import axios from "@/lib/axios"
import type { LoginDto, LoginWithPhoneDto, RegistrationDto } from "./schema"
import type { MeDto } from "./interface"

export default {
  login: async (data: LoginDto) => {
    await axios.post("/api/auth/login", data)
  },

  loginWithPhone: async (data: LoginWithPhoneDto) => {
    await axios.post("/api/auth/login-with-phone", data)
  },

  sendLoginWithPhoneCode: async (phone: string) => {
    const response = await axios.post("/api/auth/login-with-phone/send", { phone })
    return response.data
  },

  check: async (field: "username" | "email" | "phone" | "login", value: string) => {
    await axios.get("/api/auth/check", {
      params: {
        field,
        value
      }
    })
  },

  register: async (data: RegistrationDto) => {
    await axios.post("/api/auth/register", data)
  },

  google: async (code: string) => {
    await axios.post("/api/auth/google", { code })
  },

  me: async () => {
    const response = await axios.get("/api/auth/me")
    return response.data as MeDto
  }
}