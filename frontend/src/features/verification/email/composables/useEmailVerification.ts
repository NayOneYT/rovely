import { useEmailField } from "@/shared/composables/fields"
import { ref, watch, computed, onUnmounted, type Ref, toValue } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { emailVerificationApi } from "../api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { useEmailVerificationTimer } from "./useTimer"
import { toast } from "vue-sonner"
import type { CheckRegistrationStatus, SendStatus } from "../types"

export const useEmailVerification = (isProcessing: Ref<boolean>, externalName: Ref<string> | string, accountId?: string) => {
  const email = useEmailField()
  const emailServerError = ref<string>()
  watch(email.value, () => emailServerError.value = undefined)

  const { startTimer, formattedTime, clearAllTimers } = useEmailVerificationTimer()
  const sendCooldown = computed(() => formattedTime(email.value.value?.toLowerCase()))

  const checkRegistrationMutation = useMutation({
    mutationFn: emailVerificationApi.checkRegistration,
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.code === ErrorCode.EMAIL_VERIFICATION_EXPIRED) toast.warning("Необходимо заново подтвердить email")
        else toast.warning("Сначала подтвердите email")
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const checkRegistration = async (): Promise<CheckRegistrationStatus> => {
    try {
      if (!email.value.value) return "VALIDATION_ERROR"
      isProcessing.value = true
      const emailResult = await email.validate()
      if (!emailResult.valid) return "VALIDATION_ERROR"
      await checkRegistrationMutation.mutateAsync({ email: email.value.value })
      return "VERIFIED"
    } catch {
      return "NOT_VERIFIED"
    } finally {
      isProcessing.value = false
    }
  }

  const sendMutation = useMutation({
    mutationFn: emailVerificationApi.send,
    onSuccess: (data) => {
      toast.success("Письмо для подтверждения отправлено")
      startTimer(email.value.value.toLowerCase(), data.timeLeftMs)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.EMAIL_TAKEN:
            emailServerError.value = "Этот email занят"
            break
          case ErrorCode.SEND_EMAIL_COOLDOWN:
            toast.info("Письмо для подтверждения недавно уже было отправлено")
            startTimer(email.value.value.toLowerCase(), error.timeLeftMs)
            break
        }
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const send = async (): Promise<SendStatus> => {
    try {
      isProcessing.value = true
      const emailResult = await email.validate()
      if (!emailResult.valid) return "VALIDATION_ERROR"
      await sendMutation.mutateAsync({
        name: toValue(externalName),
        email: email.value.value,
        accountId
      })
      return "SUCCESS"
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorCode.EMAIL_ALREADY_VERIFIED) return "ALREADY_VERIFIED"
      return "ERROR"
    } finally {
      isProcessing.value = false
    }
  }

  onUnmounted(clearAllTimers)

  return {
    email, emailServerError, sendCooldown,
    checkRegistration, send
  }
}