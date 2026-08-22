import { storeToRefs } from "pinia"
import { useAuthStore } from "../auth.store.ts"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { loginSchema } from "../auth.schemas.ts"
import { useIdentifierField, usePasswordField } from "@/shared/composables/fields"
import { ref, watch } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { authApi } from "../auth.api"
import { useRouter } from "vue-router"
import { ApiError } from "@/shared/api/errors"
import { ErrorCode } from "@shared/error-code.enums"
import { toast } from "vue-sonner"
import { queryClient } from "@/shared/api"
import { currentAccountQueryOptions } from "@/entities/account/useCurrentAccount"

export const useLoginForm = () => {
  const { theUserLoggedInOnce, loginIdentifier, loginPassword, rememberMe, isProcessing } = storeToRefs(useAuthStore())
  const router = useRouter()

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(loginSchema)
  })

  const identifierServerError = ref<string>()
  const passwordServerError = ref<string>()

  const identifier = useIdentifierField(loginIdentifier)
  watch(identifier.value, () => {
    identifierServerError.value = undefined
    passwordServerError.value = undefined
  })

  const password = usePasswordField(loginPassword)
  watch(password.value, () => passwordServerError.value = undefined)

  const {
    handleChange: rememberMeHandleChange
  } = useField("rememberMe")


  watch(rememberMe, () => {
    rememberMeHandleChange(rememberMe.value)
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.ACCOUNT_NOT_FOUND:
            identifierServerError.value = "Аккаунт не найден"
            break
          case ErrorCode.PASSWORD_NOT_SET:
            identifierServerError.value = "Войдите через Google"
            break
          case ErrorCode.PASSWORD_INVALID:
            passwordServerError.value = "Неверный пароль"
            break
        }
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const login = handleSubmit(async (values) => {
    try {
      isProcessing.value = true
      identifierServerError.value = undefined
      passwordServerError.value = undefined
      await loginMutation.mutateAsync(values)
      await queryClient.resetQueries({ queryKey: ["account", "me"] })
      const currentAccount = await queryClient.fetchQuery(currentAccountQueryOptions)
      router.replace(`/profiles/${currentAccount!.profile.username}`)
      theUserLoggedInOnce.value = true
    } catch { } finally {
      isProcessing.value = false
    }
  })

  return {
    identifier, identifierServerError,
    password, passwordServerError,
    login
  }
}