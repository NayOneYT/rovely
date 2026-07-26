import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { loginSchema } from "../schema"
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

  const {
    value: identifier,
    errorMessage: identifierClientError,
    validate: identifierValidate,
    meta: identifierMeta,
    handleBlur: identifierHandleBlur
  } = useField("identifier", undefined, {
    validateOnValueUpdate: false
  })

  const {
    value: password,
    errorMessage: passwordClientError,
    validate: passwordValidate,
    meta: passwordMeta,
    handleBlur: passwordHandleBlur
  } = useField("password", undefined, {
    validateOnValueUpdate: false
  })

  const {
    handleChange: rememberMeHandleChange
  } = useField("rememberMe")

  const identifierServerError = ref<undefined | string>(undefined)
  const passwordServerError = ref<undefined | string>(undefined)

  watch(identifier, () => {
    identifierServerError.value = undefined
    if (identifierMeta.touched) identifierValidate()
  })

  watch(password, () => {
    passwordServerError.value = undefined
    if (passwordMeta.touched) passwordValidate()
  })

  watch(rememberMe, () => {
    rememberMeHandleChange(rememberMe.value)
  })

  const onIdentifierBlur = () => {
    if (identifierMeta.dirty) {
      identifierHandleBlur()
      identifierValidate()
    }
  }
  const onPasswordBlur = () => {
    if (passwordMeta.dirty) {
      passwordHandleBlur()
      passwordValidate()
    }
  }

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
      await loginMutation.mutateAsync(values)
    } catch { } finally {
      isProcessing.value = false
    }
  })

  return {
    identifier, identifierClientError, identifierServerError, onIdentifierBlur,
    password, passwordClientError, passwordServerError, onPasswordBlur,
    login
  }
}