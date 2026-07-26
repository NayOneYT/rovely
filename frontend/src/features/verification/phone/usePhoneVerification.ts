import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { optionalPhoneSchema, codeSchema } from "@/shared/schemas"
import { ref, watch, computed, onUnmounted, type Ref, toValue } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { phoneVerificationApi } from "./api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { AsYouType } from "libphonenumber-js"
import { useMessageTimer } from "@/shared/composables/useMessageTimer"
import { toast } from "vue-sonner"
import type { CheckRegistrationStatus, SendStatus, VerifyStatus } from "./types"

export const usePhoneVerification = (isProcessing: Ref<boolean>, externalName: Ref<string> | string, accountId?: string) => {
  const { startTimer, formattedTime, clearAllTimers } = useMessageTimer()

  const sendCooldown = computed(() => formattedTime(phone.value ?? ""))

  const {
    value: phone,
    errorMessage: phoneClientError,
    validate: phoneValidate,
    meta: phoneMeta,
    handleBlur: phoneHandleBlur,
    handleChange: phoneHandleChange
  } = useField<string>("phone", toTypedSchema(optionalPhoneSchema))

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
    setErrors: codeSetErrors,
    handleChange: codeHandleChange
  } = useField<string>("code", toTypedSchema(codeSchema), {
    controlled: false
  })

  const codeString = ref("")
  const onCodeInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let formatted = input.value.replace(/\D/g, '')
    input.value = formatted
    codeString.value = formatted
    codeHandleChange(formatted, false)
  }

  useField("accountId", undefined, {
    initialValue: accountId,
    controlled: false
  })

  const phoneServerError = ref<undefined | string>(undefined)
  const codeServerError = ref<undefined | string>(undefined)

  watch(phone, () => {
    phoneServerError.value = undefined
    if (phoneMeta.touched) phoneValidate()
  })

  watch(code, () => {
    codeServerError.value = undefined
    codeSetErrors("")
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

  const verifyMutation = useMutation({
    mutationFn: phoneVerificationApi.verify,
    onSuccess: () => toast.success("Номер телефона подтвержден"),
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND:
          case ErrorCode.PHONE_VERIFICATION_REQUEST_EXPIRED:
            codeServerError.value = "Запросите новый код"
            break
          case ErrorCode.PHONE_VERIFICATION_CODE_INVALID:
            codeServerError.value = "Неверный код"
            break
        }
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const verify = async (): Promise<VerifyStatus> => {
    try {
      if (!phone.value || !code.value) return "VALIDATION_ERROR"
      isProcessing.value = true
      const [phoneResult, codeResult] = await Promise.all([
        phoneValidate(),
        codeValidate()
      ])
      if (!phoneResult.valid || !codeResult.valid) return "VALIDATION_ERROR"
      await verifyMutation.mutateAsync({
        phone: phone.value,
        code: code.value,
        accountId
      })
      return "SUCCESS"
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorCode.PHONE_ALREADY_VERIFIED) return "SUCCESS"
      return "ERROR"
    } finally {
      isProcessing.value = false
    }
  }

  const checkRegistrationMutation = useMutation({
    mutationFn: phoneVerificationApi.checkRegistration,
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.code === ErrorCode.PHONE_VERIFICATION_EXPIRED) toast.warning("Необходимо заново подтвердить номер телефона")
        else toast.warning("Сначала подтвердите номер телефона")
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const checkRegistration = async (): Promise<CheckRegistrationStatus> => {
    try {
      isProcessing.value = true
      const phoneResult = await phoneValidate()
      if (!phoneResult.valid) return "VALIDATION_ERROR"
      await checkRegistrationMutation.mutateAsync({ phone: phone.value })
      return "VERIFIED"
    } catch {
      return "NOT_VERIFIED"
    } finally {
      isProcessing.value = false
    }
  }

  const sendMutation = useMutation({
    mutationFn: phoneVerificationApi.send,
    onSuccess: (data) => {
      toast.success("Код для подтверждения отправлен в Telegram")
      startTimer(phone.value, data.timeLeftMs)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.PHONE_TAKEN:
            phoneServerError.value = "Этот номер телефона занят"
            break
          case ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN:
            toast.error("Код для подтверждения недавно уже был отправлен")
            startTimer(phone.value, error.timeLeftMs)
            break
          case ErrorCode.TELEGRAM_BOT_BLOCKED:
            toast.warning("Сначала разблокируйте нашего бота в Telegram")
            break
        }
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const send = async (): Promise<SendStatus> => {
    try {
      if (!phone.value) return "VALIDATION_ERROR"
      isProcessing.value = true
      const phoneResult = await phoneValidate()
      if (!phoneResult.valid) return "VALIDATION_ERROR"
      await sendMutation.mutateAsync({
        phone: phone.value,
        name: toValue(externalName),
        accountId
      })
      return "SUCCESS"
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorCode.PHONE_ALREADY_VERIFIED) return "ALREADY_VERIFIED"
      return "ERROR"
    } finally {
      isProcessing.value = false
    }
  }

  onUnmounted(clearAllTimers)

  return {
    phone, phoneString, onPhoneInput, onPhoneBlur, phoneHandleChange, phoneValidate, phoneClientError, phoneServerError,
    codeString, onCodeInput, onCodeBlur, codeSetErrors, codeClientError, codeServerError, sendCooldown,
    verify, checkRegistration, send
  }
}