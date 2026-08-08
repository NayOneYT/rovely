import { ref, watch, computed, onUnmounted, type Ref } from "vue"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { passwordRecoveryContactsSchema } from "../schema"
import { useIdentifierField } from "@/shared/composables/fields"
import { useMutation } from "@tanstack/vue-query"
import { authApi } from "../api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { toast } from "vue-sonner"
import { usePasswordRecoveryTimer } from "./usePasswordRecoveryTimer"
import type { PasswordRecoveryStep, SendPasswordRecoveryStatus } from "../types"

export const usePasswordRecoveryForm = (isProcessing: Ref<boolean>) => {

  const step = ref<PasswordRecoveryStep>(1)
  const blurredEmail = ref<string>()
  const blurredPhone = ref<string>()

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(passwordRecoveryContactsSchema)
  })

  const identifier = useIdentifierField()
  const identifierServerError = ref<string>()
  watch(identifier.formattedString, () => identifierServerError.value = undefined)

  const { startTimer, formattedTime, clearAllTimers } = usePasswordRecoveryTimer()
  const sendEmailCooldown = computed(() => formattedTime("EMAIL", identifier.formattedString.value?.toLowerCase() ?? ""))
  const sendTelegramMessageCooldown = computed(() => formattedTime("PHONE", identifier.formattedString.value?.toLowerCase() ?? ""))

  const getContactsMutation = useMutation({
    mutationFn: authApi.getPasswordRecoveryContacts,
    onSuccess: (data) => {
      blurredEmail.value = data.email
      blurredPhone.value = data.phone
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
      step.value = 2
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
      startTimer(data.to, identifier.formattedString.value!.toLowerCase(), data.timeLeftMs)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.SEND_EMAIL_COOLDOWN:
            toast.info("Письмо для восстановления недавно уже было отправлено")
            startTimer("EMAIL", identifier.formattedString.value!.toLowerCase(), error.timeLeftMs)
            break
          case ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN:
            toast.info("Сообщение для восстановления недавно уже было отправлено")
            startTimer("PHONE", identifier.formattedString.value!, error.timeLeftMs)
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
      await sendMutation.mutateAsync({ identifier: identifier.formattedString.value!, to })
      return "SUCCESS"
    } catch {
      return "ERROR"
    } finally {
      isProcessing.value = false
    }
  }

  onUnmounted(clearAllTimers)

  return {
    identifier, identifierServerError,
    step, blurredEmail, blurredPhone, sendEmailCooldown, sendTelegramMessageCooldown,
    getContacts, send
  }
}