import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { sendVerificationCodeSchema, verifyPhoneSchema } from "./schema"
import { ref, watch, computed, onUnmounted, type Ref } from "vue"
import { useMutation } from "@tanstack/vue-query"
import api from "./api"
import { AxiosError } from "axios"
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js"
import useCodeTimer from "@/composables/useCodeTimer"
import type { ResponseErrorDto } from "@/types"
import type { CheckResponseDto } from "../types"
import type { ResponseMessageDto } from "@/types"
import { toast } from "vue-sonner"

export const usePhoneVerification = (name: Ref | string, accountId?: string) => {
  const { startTimer, formattedTime, clearAllTimers } = useCodeTimer()
  const sendCodeCooldown = computed(() => {
    if (!phone.value) return undefined
    return formattedTime(parsePhoneNumberFromString(phone.value)?.number as string)
  })

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(verifyPhoneSchema)
  })

  const {
    value: phone,
    errorMessage: phoneClientError,
    validate: phoneValidate,
    meta: phoneMeta,
    handleBlur: phoneHandleBlur,
    handleChange: phoneHandleChange
  } = useField<string>("phone")

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
  } = useField("code")

  const codeString = ref("")
  const onCodeInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let formatted = input.value.replace(/\D/g, '')
    input.value = formatted
    codeString.value = formatted
    codeHandleChange(formatted, false)
  }

  useField("accountId", undefined, {
    initialValue: accountId
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

  const verifyPhoneMutation = useMutation({
    mutationFn: api.verify,
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          phoneServerError.value = data.errors.phone
          codeServerError.value = data.errors.code
          return
        }
        toast.error(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    }
  })

  const verifyPhone = handleSubmit(async (values) => {
    try {
      const result = await verifyPhoneMutation.mutateAsync(values) as ResponseMessageDto
      toast[result.type](result.message)
      return result
    } catch {
      return null
    }
  })

  const checkRegistrationPhoneVerificationMutation = useMutation({
    mutationFn: api.checkRegistrationVerification,
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    }
  })

  const checkRegistrationPhoneVerification = async () => {
    try {
      const result = await checkRegistrationPhoneVerificationMutation.mutateAsync(parsePhoneNumberFromString(phone.value)?.number as string) as CheckResponseDto
      return result.verified
    } catch {
      return false
    }
  }

  const sendVerificationCodeMutation = useMutation({
    mutationFn: api.sendVerificationCode,
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          phoneServerError.value = data.errors.phone
          if (data.errors.message) toast.warning(data.errors.message)
          return
        }
        toast.error(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    }
  })

  const sendVerificationCode = async () => {
    try {
      const phoneResult = await phoneValidate()
      if (!phoneResult.valid) return
      const rawData = {
        name: typeof name === "string" ? name : name.value,
        phone: phone.value,
        accountId
      }
      const validatedData = sendVerificationCodeSchema.parse(rawData)
      const result = await sendVerificationCodeMutation.mutateAsync(validatedData) as ResponseMessageDto
      if (result.secondsLeft) {
        codeServerError.value = undefined
        startTimer(validatedData.phone, result.secondsLeft)
      }
      toast[result.type](result.message)
    } catch { }
  }

  onUnmounted(clearAllTimers)

  return {
    phoneString, onPhoneInput, onPhoneBlur, phoneHandleChange, phoneClientError, phoneServerError,
    codeString, onCodeInput, onCodeBlur, codeClientError, codeServerError, codeSetErrors, sendCodeCooldown,
    verifyPhone, checkRegistrationPhoneVerification, sendVerificationCode
  }
}