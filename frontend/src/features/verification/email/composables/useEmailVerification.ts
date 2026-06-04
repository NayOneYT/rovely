import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { ref, watch, computed, onUnmounted, type Ref } from "vue"
import { sendVerificationEmailSchema } from "../schema"
import { useMutation } from "@tanstack/vue-query"
import api from "../api"
import { AxiosError } from "axios"
import useTimer from "./useTimer"
import type { CheckResponseDto } from "../../interface"
import type { ResponseMessageDto } from "@/interface"
import type { ResponseErrorDto } from "@/interface"
import { toast } from "vue-sonner"

export const useEmailVerification = (name: Ref | string, accountId?: string) => {
  const { startTimer, formattedTime, clearAllTimers } = useTimer()
  const sendVerificationEmailCooldown = computed(() => formattedTime(email.value?.toLowerCase()))

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(sendVerificationEmailSchema)
  })

  useField("name", undefined, {
    initialValue: typeof name === "string" ? name : name.value,
  })

  const {
    value: email,
    errorMessage: emailClientError,
    validate: emailValidate,
    meta: emailMeta,
    handleBlur: emailHandleBlur,
    handleChange: emailHandleChange
  } = useField<string>("email", undefined, {
    validateOnValueUpdate: false
  })

  useField("accountId", undefined, {
    initialValue: accountId
  })

  const emailServerError = ref<undefined | string>(undefined)

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

  const checkRegistrationEmailVerificationMutation = useMutation({
    mutationFn: api.checkRegistrationVerification,
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    }
  })

  const checkRegistrationEmailVerification = async () => {
    try {
      const result = await checkRegistrationEmailVerificationMutation.mutateAsync(email.value) as CheckResponseDto
      return result.verified
    } catch {
      return false
    }
  }

  const sendVerificationEmailMutation = useMutation({
    mutationFn: api.sendVerificationEmail,
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          emailServerError.value = data.errors.email
          return
        }
        toast.error(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    }
  })

  const sendVerificationEmail = handleSubmit(async (values) => {
    try {
      const result = await sendVerificationEmailMutation.mutateAsync({ ...values, name: typeof name === "string" ? name : name.value }) as ResponseMessageDto
      if (result.secondsLeft) startTimer(email.value.toLowerCase(), result.secondsLeft)
      toast[result.type](result.message)
    } catch {
      return null
    }
  })

  onUnmounted(clearAllTimers)

  return {
    email, onEmailBlur, emailHandleChange, emailClientError, emailServerError, sendVerificationEmailCooldown,
    checkRegistrationEmailVerification, sendVerificationEmail
  }
}