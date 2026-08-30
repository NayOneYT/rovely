import { useEmailField } from "@/shared/composables/fields"
import { ref, watch, computed } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { emailVerificationApi } from "../email-verification.api"
import { ApiError } from "@/shared/api/errors"
import { ErrorCode } from "@shared/error-code.enums"
import { useTimer } from "@/shared/composables"
import { toast } from "vue-sonner"
import { sendSchema } from "../email-verification.schemas"
import type { useEmailVerificationOptions, CheckRegistrationStatus, SendStatus } from "../email-verification.types"

export const useEmailVerification = ({
  nameValue,
  emailValue,
  cooldowns,
  isProcessing
}: useEmailVerificationOptions) => {
  const email = useEmailField(emailValue)
  const emailServerError = ref<string>()
  watch(email.value, () => emailServerError.value = undefined)

  const { createNewTimer, formattedTime } = useTimer(cooldowns)
  const sendCooldown = computed(() => formattedTime(email.value.value.toLowerCase()))

  const checkRegistrationMutation = useMutation({
    mutationFn: emailVerificationApi.checkRegistration,
    onError: (error) => {
      if (error instanceof ApiError) toast.warning("Сначала подтвердите email")
      else toast.error("Что-то пошло не так, попробуйте позже")
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
      createNewTimer(email.value.value.toLowerCase(), data.timeLeftMs)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.EMAIL_TAKEN:
            emailServerError.value = "Этот email занят"
            break
          case ErrorCode.SEND_EMAIL_COOLDOWN:
            toast.info("Письмо для подтверждения недавно уже было отправлено")
            createNewTimer(email.value.value.toLowerCase(), error.timeLeftMs)
            break
        }
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const send = async (): Promise<SendStatus> => {
    try {
      isProcessing.value = true
      emailServerError.value = undefined
      const parseResult = sendSchema.safeParse({
        name: nameValue.value,
        email: email.value.value
      })
      if (!parseResult.success) return "VALIDATION_ERROR"
      await sendMutation.mutateAsync(parseResult.data)
      return "SUCCESS"
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorCode.EMAIL_ALREADY_VERIFIED) return "ALREADY_VERIFIED"
      return "ERROR"
    } finally {
      isProcessing.value = false
    }
  }

  return {
    email, emailServerError, sendCooldown,
    checkRegistration, send
  }
}