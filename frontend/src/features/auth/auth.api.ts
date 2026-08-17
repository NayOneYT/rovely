import { api } from "@/shared/api"
import type {
  LoginDto, LoginWithPhoneDto, SendLoginWithPhoneDto, CheckAvailabilityDto, RegisterDto,
  PasswordRecoveryContactsDto, SendPasswordRecoveryDto, CheckPasswordRecoveryTokenDto, ResetPasswordDto
} from "./auth.schemas"
import type {
  SendLoginWithPhoneResponse, GetPasswordRecoveryContactsResponse, SendPasswordRecoveryResponse,
  CheckPasswordRecoveryTokenResponse
} from "./auth.types"

export const authApi = {
  login: async (data: LoginDto) => {
    await api.post("/auth/login", data)
  },

  loginWithPhone: async (data: LoginWithPhoneDto) => {
    await api.post("/auth/login-with-phone", data)
  },

  sendLoginWithPhone: async (data: SendLoginWithPhoneDto) => {
    const response = await api.post<SendLoginWithPhoneResponse>("/auth/login-with-phone/send", data)
    return response.data
  },

  checkAvailability: async (data: CheckAvailabilityDto) => {
    await api.post("/auth/check-availability", data)
  },

  register: async (data: RegisterDto) => {
    await api.post("/auth/register", data)
  },

  google: async (code: string) => {
    await api.post("/auth/google", { code })
  },

  getPasswordRecoveryContacts: async (data: PasswordRecoveryContactsDto) => {
    const response = await api.post<GetPasswordRecoveryContactsResponse>("/auth/password-recovery/contacts", data)
    return response.data
  },

  sendPasswordRecovery: async (data: SendPasswordRecoveryDto) => {
    const response = await api.post<SendPasswordRecoveryResponse>("/auth/password-recovery/send", data)
    return response.data
  },

  checkPasswordRecoveryToken: async (data: CheckPasswordRecoveryTokenDto) => {
    const response = await api.get<CheckPasswordRecoveryTokenResponse>(`/auth/password-recovery/check-token/${data.token}`)
    return response.data
  },

  resetPassword: async (data: ResetPasswordDto) => {
    await api.post("/auth/password-recovery/reset", data)
  },

  logout: async () => {
    await api.post("/auth/logout")
  }
}