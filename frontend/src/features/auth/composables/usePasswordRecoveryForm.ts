import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores"
import { useTimer } from "@/shared/composables"
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { passwordRecoveryContactsSchema } from "../schema"
import { ref, watch, computed } from "vue"
import { useIdentifierField } from "@/shared/composables/fields"
import { useMutation } from "@tanstack/vue-query"
import { authApi } from "../api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { toast } from "vue-sonner"

export const usePasswordRecoveryForm = () => {
  const {
    passwordRecoveryStep, passwordRecoveryIdentifier,
    passwordRecoveryBlurredEmail, passwordRecoverySendEmailCooldownsUntilMs,
    passwordRecoveryBlurredPhone, passwordRecoverySendTelegramMessageCooldownsUntilMs,
    isProcessing
  } = storeToRefs(useAuthStore())

  const {
    createNewTimer: createNewEmailTimer, formattedTime: formattedEmailTime
  } = useTimer(passwordRecoverySendEmailCooldownsUntilMs)

  const {
    createNewTimer: createNewTelegramMessageTimer, formattedTime: formattedTelegramMessageTime
  } = useTimer(passwordRecoverySendTelegramMessageCooldownsUntilMs)

  const sendEmailCooldown = computed(() => formattedEmailTime(identifier.value.value?.toLowerCase()))
  const sendTelegramMessageCooldown = computed(() => formattedTelegramMessageTime(identifier.value.value))

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(passwordRecoveryContactsSchema)
  })

  const identifier = useIdentifierField(passwordRecoveryIdentifier)
  const identifierServerError = ref<string>()
  watch(identifier.value, () => identifierServerError.value = undefined)

  const getContactsMutation = useMutation({
    mutationFn: authApi.getPasswordRecoveryContacts,
    onSuccess: (data) => {
      passwordRecoveryBlurredEmail.value = data.email
      passwordRecoveryBlurredPhone.value = data.phone
    },
    onError: (error) => {
      if (error instanceof ApiError) identifierServerError.value = "Аккаунт не найден"
      else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const getContacts = handleSubmit(async (values) => {
    try {
      isProcessing.value = true
      identifierServerError.value = undefined
      await getContactsMutation.mutateAsync(values)
      passwordRecoveryStep.value = 2
    } catch { } finally {
      isProcessing.value = false
    }
  })

  const sendMutation = useMutation({
    mutationFn: authApi.sendPasswordRecovery,
    onSuccess: (data) => {
      if (data.to === "EMAIL") {
        toast.success("Письмо для восстановления отправлено")
        createNewEmailTimer(identifier.value.value.toLowerCase(), data.timeLeftMs)
      } else {
        toast.success("Сообщение для восстановления отправлено в Telegram")
        createNewTelegramMessageTimer(identifier.value.value, data.timeLeftMs)
      }
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ErrorCode.SEND_EMAIL_COOLDOWN:
            toast.info("Письмо для восстановления недавно уже было отправлено")
            createNewEmailTimer(identifier.value.value.toLowerCase(), error.timeLeftMs)
            break
          case ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN:
            toast.info("Сообщение для восстановления недавно уже было отправлено")
            createNewTelegramMessageTimer(identifier.value.value, error.timeLeftMs)
            break
          case ErrorCode.TELEGRAM_BOT_BLOCKED:
            toast.warning("Сначала разблокируйте нашего бота в Telegram")
            break
          default:
            toast.error("Произошла ошибка, попробуйте еще раз")
            passwordRecoveryStep.value = 1
            break
        }
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const send = async (to: "EMAIL" | "PHONE") => {
    try {
      isProcessing.value = true
      await sendMutation.mutateAsync({ identifier: identifier.value.value, to })
    } catch { } finally {
      isProcessing.value = false
    }
  }

  return {
    identifier, identifierServerError,
    sendEmailCooldown, sendTelegramMessageCooldown,
    getContacts, send
  }
}