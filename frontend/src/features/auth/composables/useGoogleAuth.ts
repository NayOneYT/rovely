import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores"
import { useRouter } from "vue-router"
import { authApi } from "../api"
import { queryClient } from "@/shared/api"
import { currentAccountQueryOptions } from "@/entities/account/useCurrentAccount"
import { ApiError } from "@/shared/api/types"
import { toast } from "vue-sonner"
import { config } from "@/shared/config"
import { useMutation } from "@tanstack/vue-query"

export const useGoogleAuth = () => {
  const { theUserLoggedInOnce, isProcessing } = storeToRefs(useAuthStore())
  const router = useRouter()

  const authenticateMutation = useMutation({
    mutationFn: authApi.google,
    onError: (error) => {
      if (error instanceof ApiError) toast.error("Не удалось авторизоваться через Google, попробуйте позже.")
      else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const authenticate = async (response: google.accounts.oauth2.CodeResponse) => {
    try {
      isProcessing.value = true
      await authenticateMutation.mutateAsync(response.code)
      await queryClient.resetQueries({ queryKey: ["account", "me"] })
      const currentAccount = await queryClient.fetchQuery(currentAccountQueryOptions)
      router.replace(`/profiles/${currentAccount!.profile.username}`)
      theUserLoggedInOnce.value = true
    } catch { } finally {
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

  const googleAuth = () => googleClient.requestCode

  return { googleAuth }
}