import { usePhoneField, useCodeField } from "@/shared/composables/fields"
import { watch, ref, computed } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { phoneVerificationApi } from "./api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { useTimer } from "@/shared/composables"
import { toast } from "vue-sonner"
import { sendSchema } from "./schema"
import type { usePhoneVerificationOptions, CheckRegistrationStatus, SendStatus, VerifyStatus } from "./types"

export const usePhoneVerification = ({
  nameValue,
  phoneValue,
  codeValue,
  cooldowns,
  isProcessing
}: usePhoneVerificationOptions) => {
  const phone = usePhoneField(phoneValue)
  const phoneServerError = ref<string>()
  watch(phone.value, () => phoneServerError.value = undefined)

  const code = useCodeField(phoneValue, false)
  const codeServerError = ref<string>()
  watch(code.value, () => codeServerError.value = undefined)

  const { createNewTimer, formattedTime } = useTimer(cooldowns)
  const sendCooldown = computed(() => formattedTime(phone.value.value))

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
      isProcessing.value = true
      const [phoneResult, codeResult] = await Promise.all([
        phone.validate(),
        code.validate()
      ])
      if (!phoneResult.valid || !codeResult.valid) return "VALIDATION_ERROR"
      phoneServerError.value = undefined
      codeServerError.value = undefined
      await verifyMutation.mutateAsync({
        phone: phone.value.value,
        code: code.value.value
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
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const checkRegistration = async (): Promise<CheckRegistrationStatus> => {
    try {
      isProcessing.value = true
      const phoneResult = await phone.validate()
      if (!phoneResult.valid) return "VALIDATION_ERROR"
      await checkRegistrationMutation.mutateAsync({ phone: phone.value.value })
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
      createNewTimer(phone.value.value, data.timeLeftMs)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.PHONE_TAKEN:
            phoneServerError.value = "Этот номер телефона занят"
            break
          case ErrorCode.TELEGRAM_LINK_NOT_FOUND:
            toast.warning("Сначала отправьте свой номер телефона нашему боту в Telegram")
            break
          case ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN:
            toast.info("Код для подтверждения недавно уже был отправлен")
            createNewTimer(phone.value.value, error.timeLeftMs)
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
      isProcessing.value = true
      const parseResult = sendSchema.safeParse({
        phone: phone.value.value,
        name: nameValue.value
      })
      if (!parseResult.success) return "VALIDATION_ERROR"
      await sendMutation.mutateAsync(parseResult.data)
      return "SUCCESS"
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorCode.PHONE_ALREADY_VERIFIED) return "ALREADY_VERIFIED"
      return "ERROR"
    } finally {
      isProcessing.value = false
    }
  }

  return {
    phone, phoneServerError,
    code, codeServerError, sendCooldown,
    verify, checkRegistration, send
  }
}