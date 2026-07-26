import { config } from "@/shared/config"
import { authApi } from "../api"
import { ApiError } from "@/shared/api/types"
import { toast } from "vue-sonner"
import { useRouter } from "vue-router"
import { useLocalStorage } from "@vueuse/core"
import type { Ref } from "vue"

export const useGoogleAuth = (isProcessing: Ref<boolean>) => {
  const router = useRouter()
  const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)

  const authenticate = async (response: google.accounts.oauth2.CodeResponse) => {
    if (response.error) {
      toast.info("Авторизация через Google была отменена")
      isProcessing.value = false
      return
    }
    try {
      await authApi.google(response.code)
      const account = await authApi.me()
      theUserLoggedInOnce.value = true
      router.push(`/profiles/${account.profile.username}`)
    } catch (error) {
      if (error instanceof ApiError) toast.error("Не удалось авторизоваться через Google, попробуйте позже.")
      else toast.error("Что-то пошло не так, попробуйте позже")
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