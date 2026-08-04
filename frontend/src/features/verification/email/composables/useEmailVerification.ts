import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { emailSchema } from "@/shared/schemas"
import { ref, watch, computed, onUnmounted, type Ref, toValue } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { emailVerificationApi } from "../api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { useEmailVerificationTimer } from "./useTimer"
import { toast } from "vue-sonner"
import type { CheckRegistrationStatus, SendStatus } from "../types"

export const useEmailVerification = (isProcessing: Ref<boolean>, externalName: Ref<string> | string, accountId?: string) => {
  const { startTimer, formattedTime, clearAllTimers } = useEmailVerificationTimer()

  const sendCooldown = computed(() => formattedTime(email.value?.toLowerCase() ?? ""))

  const {
    value: email,
    errorMessage: emailClientError,
    validate: emailValidate,
    meta: emailMeta,
    handleBlur: emailHandleBlur,
    handleChange: emailHandleChange
  } = useField<string>("email", toTypedSchema(emailSchema), {
    validateOnValueUpdate: false,
  })

  const emailServerError = ref<string>()

  watch(email, () => {
    emailServerError.value = undefined
    if (emailMeta.touched) emailValidate()
  })

  const onEmailBlur = () => {
    if (emailMeta.dirty) {
      emailHandleBlur()
      emailValidate()
    }
  }

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
      if (!email.value) return "VALIDATION_ERROR"
      isProcessing.value = true
      const emailResult = await emailValidate()
      if (!emailResult.valid) return "VALIDATION_ERROR"
      await checkRegistrationMutation.mutateAsync({ email: email.value })
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
      startTimer(email.value.toLowerCase(), data.timeLeftMs)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.EMAIL_TAKEN:
            emailServerError.value = "Этот email занят"
            break
          case ErrorCode.SEND_EMAIL_COOLDOWN:
            toast.info("Письмо для подтверждения недавно уже было отправлено")
            startTimer(email.value.toLowerCase(), error.timeLeftMs)
            break
        }
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const send = async (): Promise<SendStatus> => {
    try {
      isProcessing.value = true
      const emailResult = await emailValidate()
      if (!emailResult.valid) return "VALIDATION_ERROR"
      await sendMutation.mutateAsync({
        name: toValue(externalName),
        email: email.value,
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
    email, onEmailBlur, emailHandleChange, emailValidate, emailClientError, emailServerError, sendCooldown,
    checkRegistration, send
  }
}