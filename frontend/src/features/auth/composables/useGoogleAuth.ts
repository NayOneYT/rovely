import { config } from "@/config"
import api from "../api"
import { AxiosError } from "axios"
import { toast } from "vue-sonner"
import type { Ref } from "vue"

export const useGoogleAuth = (isProcessing: Ref<boolean>) => {
  const authenticate = async (response: google.accounts.oauth2.CodeResponse) => {
    if (response.error) {
      isProcessing.value = false
      return
    }
    try {
      await api.google(response.code)
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    } finally {
      isProcessing.value = false
    }
  }

  const googleClient = google.accounts.oauth2.initCodeClient({
    client_id: config.googleClientId,
    scope: 'openid profile email',
    ux_mode: 'popup',
    callback: authenticate,
    error_callback: () => isProcessing.value = false
  })

  return { googleClient }
}