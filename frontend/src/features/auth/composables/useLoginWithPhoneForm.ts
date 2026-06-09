import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { loginWithPhoneSchema } from "../schema"
import { ref, computed, watch, onUnmounted, type Ref } from "vue"
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js"
import useCodeTimer from "@/composables/useCodeTimer"
import { useMutation } from "@tanstack/vue-query"
import api from "../api"
import { useRouter } from "vue-router"
import { useLocalStorage } from "@vueuse/core"
import { AxiosError } from "axios"
import { toast } from "vue-sonner"
import type { ResponseErrorDto, ResponseMessageDto } from "@/interface"

export const useLoginWithPhoneForm = (isProcessing: Ref<boolean>) => {
  const { startTimer, formattedTime, clearAllTimers } = useCodeTimer()
  const sendCodeCooldown = computed(() => {
    if (!phone.value) return undefined
    return formattedTime(parsePhoneNumberFromString(phone.value)?.number as string)
  })
  const router = useRouter()
  const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)
  const rememberMe = useLocalStorage("rememberMe", false)

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(loginWithPhoneSchema)
  })

  const {
    value: phone,
    errorMessage: phoneClientError,
    validate: phoneValidate,
    meta: phoneMeta,
    handleBlur: phoneHandleBlur,
    handleChange: phoneHandleChange
  } = useField<string>("phone")

  const phoneString = ref("")
  const onPhoneInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let raw = input.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
    if (raw && !raw.startsWith('+')) raw = '+' + raw
    const formatted = new AsYouType().input(raw)
    input.value = formatted
    phoneString.value = formatted
    phoneHandleChange(formatted, false)
  }

  const {
    value: code,
    errorMessage: codeClientError,
    validate: codeValidate,
    meta: codeMeta,
    handleBlur: codeHandleBlur,
    handleChange: codeHandleChange
  } = useField("code")

  const codeString = ref("")
  const onCodeInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let formatted = input.value.replace(/\D/g, '')
    input.value = formatted
    codeString.value = formatted
    codeHandleChange(formatted, false)
  }

  const {
    handleChange: rememberMeHandleChange
  } = useField("rememberMe")

  const phoneServerError = ref<undefined | string>(undefined)
  const codeServerError = ref<undefined | string>(undefined)

  watch(phone, () => {
    phoneServerError.value = undefined
    if (phoneMeta.touched) phoneValidate()
  })

  watch(code, () => {
    codeServerError.value = undefined
    if (codeMeta.touched) codeValidate()
  })

  watch(rememberMe, () => {
    rememberMeHandleChange(rememberMe.value, false)
  })

  const onPhoneBlur = () => {
    if (phoneMeta.dirty) {
      phoneHandleBlur()
      phoneValidate()
    }
  }

  const onCodeBlur = () => {
    if (codeMeta.dirty) {
      codeHandleBlur()
      codeValidate()
    }
  }

  const loginWithPhoneMutation = useMutation({
    mutationFn: api.loginWithPhone,
    onMutate: () => isProcessing.value = true,
    onSuccess: async () => {
      const account = await api.me()
      router.push(`/profiles/${account.profile.username}`)
      theUserLoggedInOnce.value = true
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          phoneServerError.value = data.errors.phone
          codeServerError.value = data.errors.code
          return
        }
        toast.error(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    },
    onSettled: () => isProcessing.value = false
  })

  const loginWithPhone = handleSubmit((values) => {
    loginWithPhoneMutation.mutate(values)
  })

  const sendLoginWithPhoneCodeMutation = useMutation({
    mutationFn: api.sendLoginWithPhoneCode,
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          phoneServerError.value = data.errors.phone
          if (data.errors.message) toast.warning(data.errors.message)
          return
        }
        toast.error(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    }
  })

  const sendLoginWithPhoneCode = async () => {
    try {
      const phoneResult = await phoneValidate()
      if (!phoneResult.valid) return
      const result = await sendLoginWithPhoneCodeMutation.mutateAsync(phone.value) as ResponseMessageDto
      if (result.secondsLeft) {
        codeServerError.value = undefined
        startTimer(parsePhoneNumberFromString(phone.value)?.number as string, result.secondsLeft)
      }
      toast[result.type](result.message)
    } catch { }
  }

  onUnmounted(clearAllTimers)

  return {
    phoneString, onPhoneInput, onPhoneBlur, phoneClientError, phoneServerError,
    codeString, onCodeInput, onCodeBlur, codeClientError, codeServerError, sendCodeCooldown,
    loginWithPhone, sendLoginWithPhoneCode
  }
}