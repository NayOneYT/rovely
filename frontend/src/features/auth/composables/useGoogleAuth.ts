import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores"
import { useRouter } from "vue-router"
import { authApi } from "../api"
import { ApiError } from "@/shared/api/types"
import { toast } from "vue-sonner"
import { config } from "@/shared/config"

export const useGoogleAuth = () => {
  const { theUserLoggedInOnce, isProcessing } = storeToRefs(useAuthStore())
  const router = useRouter()

  const authenticate = async (response: google.accounts.oauth2.CodeResponse) => {
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