import { useTimer } from "@/shared/composables"
import { storeToRefs } from "pinia"
import { useAuthStore } from "../auth.store.ts"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { loginWithPhoneSchema } from "../auth.schemas.ts"
import { usePhoneField, useCodeField } from "@/shared/composables/fields"
import { ref, computed, watch } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { authApi } from "../auth.api"
import { useRouter } from "vue-router"
import { ApiError, ErrorCode } from "@/shared/api/errors"
import { toast } from "vue-sonner"
import { queryClient } from "@/shared/api"
import { currentAccountQueryOptions } from "@/entities/account/useCurrentAccount"

export const useLoginWithPhoneForm = () => {
  const {
    theUserLoggedInOnce,
    loginWithPhonePhone, loginWithPhoneCode, loginWithPhoneSendCooldownsUntilMs,
    rememberMe,
    isProcessing
  } = storeToRefs(useAuthStore())

  const { createNewTimer, formattedTime } = useTimer(loginWithPhoneSendCooldownsUntilMs)
  const sendCooldown = computed(() => formattedTime(phone.value.value ?? ""))

  const now = Date.now()
  Object.entries(loginWithPhoneSendCooldownsUntilMs.value).forEach(([phone, sendCooldownUntilMs]) => {
    if (sendCooldownUntilMs <= now) delete loginWithPhoneSendCooldownsUntilMs.value[phone]
    else createNewTimer(phone, sendCooldownUntilMs)
  })

  const router = useRouter()

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(loginWithPhoneSchema)
  })

  const phoneServerError = ref<string>()
  const codeServerError = ref<string>()

  const phone = usePhoneField(loginWithPhonePhone)
  watch(phone.value, () => {
    phoneServerError.value = undefined
    codeServerError.value = undefined
  })


  const code = useCodeField(loginWithPhoneCode)
  watch(code.value, () => codeServerError.value = undefined)

  const {
    handleChange: rememberMeHandleChange
  } = useField("rememberMe")

  watch(rememberMe, () => {
    rememberMeHandleChange(rememberMe.value)
  })

  const loginMutation = useMutation({
    mutationFn: authApi.loginWithPhone,
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
      phoneServerError.value = undefined
      codeServerError.value = undefined
      await loginMutation.mutateAsync(values)
      await queryClient.resetQueries({ queryKey: ["account", "me"] })
      const currentAccount = await queryClient.fetchQuery(currentAccountQueryOptions)
      router.replace(`/profiles/${currentAccount!.profile.username}`)
      theUserLoggedInOnce.value = true
    } catch { } finally {
      isProcessing.value = false
    }
  })

  const sendMutation = useMutation({
    mutationFn: authApi.sendLoginWithPhone,
    onSuccess: (data) => {
      createNewTimer(phone.value.value, data.timeLeftMs)
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
            createNewTimer(phone.value.value, error.timeLeftMs)
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
      phoneServerError.value = undefined
      codeServerError.value = undefined
      const phoneResult = await phone.validate()
      if (!phoneResult.valid) return
      await sendMutation.mutateAsync({ phone: phone.value.value })
      return
    } catch { } finally {
      isProcessing.value = false
    }
  }

  return {
    phone, phoneServerError,
    code, codeServerError, sendCooldown,
    login, send
  }
}