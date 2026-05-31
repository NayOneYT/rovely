import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { loginSchema } from "../schema"
import { ref, watch } from "vue"
import { useMutation } from "@tanstack/vue-query"
import api from "../api"
import { useRouter } from "vue-router"
import { AxiosError } from "axios"
import { useLocalStorage } from "@vueuse/core"
import type { ResponseErrorDto } from "@/interface"

export const useLoginForm = () => {
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
    rememberMeHandleChange(rememberMe.value, false)
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
    mutationFn: api.login,
    onSuccess: async () => {
      const account = await api.me()
      router.push(`/profiles/${account.profile.username}`)
      theUserLoggedInOnce.value = true
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          identifierServerError.value = data.errors.identifier
          passwordServerError.value = data.errors.password
          return
        }
        alert(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    }
  })

  const login = handleSubmit((values) => {
    loginMutation.mutate(values)
  })

  const { isPending: isLoggingIn } = loginMutation

  return {
    identifier, identifierClientError, identifierServerError, onIdentifierBlur,
    password, passwordClientError, passwordServerError, onPasswordBlur,
    login, isLoggingIn
  }
}