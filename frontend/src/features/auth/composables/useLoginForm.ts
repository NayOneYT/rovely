import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { loginSchema } from "../schema"
import { useIdentifierField, usePasswordField } from "@/shared/composables/fields"
import { ref, watch, type Ref } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { authApi } from "../api"
import { useRouter } from "vue-router"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { useLocalStorage } from "@vueuse/core"
import { toast } from "vue-sonner"

export const useLoginForm = (isProcessing: Ref<boolean>) => {
  const router = useRouter()
  const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)
  const rememberMe = useLocalStorage("rememberMe", false)

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(loginSchema)
  })

  const identifierServerError = ref<string>()
  const passwordServerError = ref<string>()

  const identifier = useIdentifierField()
  watch(identifier.value, () => {
    identifierServerError.value = undefined
    passwordServerError.value = undefined
  })

  const password = usePasswordField()
  watch(password.value, () => passwordServerError.value = undefined)

  const {
    handleChange: rememberMeHandleChange
  } = useField("rememberMe")


  watch(rememberMe, () => {
    rememberMeHandleChange(rememberMe.value)
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      const account = await authApi.me()
      theUserLoggedInOnce.value = true
      router.replace(`/profiles/${account.profile.username}`)
    },
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
    } catch { } finally {
      isProcessing.value = false
    }
  })

  return {
    identifier, identifierServerError,
    password, passwordServerError,
    rememberMe,
    login
  }
}