import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { loginWithPhoneSchema } from "../schema"
import { usePhoneField } from "@/shared/composables/fields"
import { ref, computed, watch, onUnmounted, type Ref } from "vue"
import { useMessageTimer } from "@/shared/composables/useMessageTimer"
import { useMutation } from "@tanstack/vue-query"
import { authApi } from "../api"
import { useRouter } from "vue-router"
import { useLocalStorage } from "@vueuse/core"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { toast } from "vue-sonner"

export const useLoginWithPhoneForm = (isProcessing: Ref<boolean>) => {

  const router = useRouter()
  const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)
  const rememberMe = useLocalStorage("rememberMe", false)

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(loginWithPhoneSchema)
  })

  const phone = usePhoneField()
  const phoneServerError = ref<string>()
  watch(phone.value, () => phoneServerError.value = undefined)

  const { startTimer, formattedTime, clearAllTimers } = useMessageTimer()
  const sendCooldown = computed(() => formattedTime(phone.value.value ?? ""))

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

  const codeServerError = ref<string>()

  watch(code, () => {
    codeServerError.value = undefined
    if (codeMeta.touched) codeValidate()
  })

  watch(rememberMe, () => {
    rememberMeHandleChange(rememberMe.value)
  })

  const onCodeBlur = () => {
    if (codeMeta.dirty) {
      codeHandleBlur()
      codeValidate()
    }
  }

  const loginMutation = useMutation({
    mutationFn: authApi.loginWithPhone,
    onSuccess: async () => {
      const account = await authApi.me()
      theUserLoggedInOnce.value = true
      router.replace(`/profiles/${account.profile.username}`)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.ACCOUNT_NOT_FOUND:
            phoneServerError.value = "Аккаунт не найден"
            break
          case ErrorCode.LOGIN_WITH_PHONE_REQUEST_NOT_FOUND:
          case ErrorCode.LOGIN_WITH_PHONE_CODE_EXPIRED:
            codeServerError.value = "Запросите новый код"
            break
          case ErrorCode.LOGIN_WITH_PHONE_CODE_INVALID:
            codeServerError.value = "Неверный код"
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

  const sendMutation = useMutation({
    mutationFn: authApi.sendLoginWithPhone,
    onSuccess: (data) => {
      codeServerError.value = undefined
      startTimer(phone.value.value, data.timeLeftMs)
      toast.success("Код для входа отправлен в Telegram")
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.ACCOUNT_NOT_FOUND:
            phoneServerError.value = "Аккаунт не найден"
            break
          case ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN:
            toast.info("Код для входа недавно уже был отправлен")
            startTimer(phone.value.value, error.timeLeftMs)
            break
          case ErrorCode.TELEGRAM_BOT_BLOCKED:
            toast.warning("Сначала разблокируйте нашего бота в Telegram")
            break
        }
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const send = async () => {
    try {
      isProcessing.value = true
      const phoneResult = await phone.validate()
      if (!phoneResult.valid) return
      await sendMutation.mutateAsync({ phone: phone.value.value })
      return
    } catch { } finally {
      isProcessing.value = false
    }
  }

  onUnmounted(clearAllTimers)

  return {
    phone, phoneServerError,
    codeString, onCodeInput, onCodeBlur, codeClientError, codeServerError, sendCooldown,
    rememberMe,
    login, send
  }
}