import { ref, watch, computed, onUnmounted, type Ref } from "vue"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { passwordRecoveryContactsSchema } from "../schema"
import { useMutation } from "@tanstack/vue-query"
import { authApi } from "../api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { toast } from "vue-sonner"
import { usePasswordRecoveryTimer } from "./usePasswordRecoveryTimer"
import { AsYouType } from "libphonenumber-js"
import type { PasswordRecoveryStep, SendPasswordRecoveryStatus } from "../types"

export const usePasswordRecoveryForm = (isProcessing: Ref<boolean>) => {
  const { startTimer, formattedTime, clearAllTimers } = usePasswordRecoveryTimer()

  const sendEmailCooldown = computed(() => formattedTime("EMAIL", identifier.value?.toLowerCase() ?? ""))

  const sendTelegramMessageCooldown = computed(() => formattedTime("PHONE", identifier.value ?? ""))

  const step = ref<PasswordRecoveryStep>(1)
  const blurredEmail = ref<string | undefined>(undefined)
  const blurredPhone = ref<string | undefined>(undefined)

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(passwordRecoveryContactsSchema)
  })

  const {
    value: identifier,
    errorMessage: identifierClientError,
    validate: identifierValidate,
    meta: identifierMeta,
    handleBlur: identifierHandleBlur,
    handleChange: identifierHandleChange
  } = useField<string>("identifier", undefined, {
    validateOnValueUpdate: false
  })

  const identifierString = ref<string>("")
  const onIdentifierInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.value.startsWith("+")) {
      identifierString.value = input.value
      identifierHandleChange(input.value, false)
      return
    }
    let raw = input.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
    const formatted = new AsYouType().input(raw)
    input.value = formatted
    identifierString.value = formatted
    identifierHandleChange(formatted, false)
  }

  const identifierServerError = ref<undefined | string>(undefined)

  watch(identifier, () => {
    identifierServerError.value = undefined
    if (identifierMeta.touched) identifierValidate()
  })

  const onIdentifierBlur = () => {
    if (identifierMeta.dirty) {
      identifierHandleBlur()
      identifierValidate()
    }
  }

  const getContactsMutation = useMutation({
    mutationFn: authApi.getPasswordRecoveryContacts,
    onSuccess: (data) => {
      blurredEmail.value = data.email
      blurredPhone.value = data.phone
      step.value = 2
    },
    onError: (error) => {
      if (error instanceof ApiError) identifierServerError.value = "Аккаунт не найден"
      else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const getContacts = handleSubmit(async (values) => {
    try {
      isProcessing.value = true
      await getContactsMutation.mutateAsync(values)
    } catch { } finally {
      isProcessing.value = false
    }
  })

  const sendMutation = useMutation({
    mutationFn: authApi.sendPasswordRecovery,
    onSuccess: (data) => {
      toast.success(data.to === "EMAIL"
        ? "Письмо для восстановления отправлено"
        : "Сообщение для восстановления отправлено в Telegram"
      )
      startTimer(data.to, identifier.value.toLowerCase(), data.timeLeftMs)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.SEND_EMAIL_COOLDOWN:
            toast.error("Письмо для восстановления недавно уже было отправлено")
            startTimer("EMAIL", identifier.value.toLowerCase(), error.timeLeftMs)
            break
          case ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN:
            toast.error("Сообщение для восстановления недавно уже было отправлено")
            startTimer("PHONE", identifier.value, error.timeLeftMs)
            break
          case ErrorCode.TELEGRAM_BOT_BLOCKED:
            toast.warning("Сначала разблокируйте нашего бота в Telegram")
            break
        }
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const send = async (to: "EMAIL" | "PHONE"): Promise<SendPasswordRecoveryStatus> => {
    try {
      if (!identifier.value) return "VALIDATION_ERROR"
      isProcessing.value = true
      const identifierResult = await identifierValidate()
      if (!identifierResult.valid) return "VALIDATION_ERROR"
      await sendMutation.mutateAsync({ identifier: identifier.value, to })
      return "SUCCESS"
    } catch {
      return "ERROR"
    } finally {
      isProcessing.value = false
    }
  }

  onUnmounted(clearAllTimers)

  return {
    identifierString, onIdentifierInput, identifierClientError, identifierServerError, onIdentifierBlur,
    step, blurredEmail, blurredPhone, sendEmailCooldown, sendTelegramMessageCooldown,
    getContacts, send
  }
}