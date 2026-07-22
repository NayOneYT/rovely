import { ref, watch, computed, onUnmounted } from "vue"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { passwordRecoveryContactsSchema } from "../schema"
import { useMutation } from "@tanstack/vue-query"
import api from "../api"
import { AxiosError } from "axios"
import { toast } from "vue-sonner"
import usePasswordRecoveryTimer from "./usePasswordRecoveryTimer"
import { AsYouType } from "libphonenumber-js"
import type { Ref } from "vue"
import type { ResponseErrorDto } from "@/shared/types"
import type { SendPasswordRecoveryResponseErrorDataDto } from "../types"

export const usePasswordRecoveryForm = (isProcessing: Ref<boolean>) => {
  const { startTimer, formattedTime, clearAllTimers } = usePasswordRecoveryTimer()
  const sendPasswordRecoveryEmailCooldown = computed(() => {
    if (typeof (email.value) === "string") return formattedTime("EMAIL", identifier.value.toLowerCase())
    return null
  })
  const sendPasswordRecoveryMessageCooldown = computed(() => {
    if (typeof (phone.value) === "string") return formattedTime("PHONE", identifier.value.toLowerCase())
    return null
  })
  const step = ref<1 | 2>(1)
  const email = ref<string | undefined>(undefined)
  const phone = ref<string | undefined>(undefined)

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

  const passwordRecoveryContactsMutation = useMutation({
    mutationFn: api.passwordRecoveryContacts,
    onMutate: () => isProcessing.value = true,
    onSuccess: (contacts) => {
      email.value = contacts.email
      phone.value = contacts.phone
      step.value = 2
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          identifierServerError.value = data.errors.identifier
          return
        }
        toast.error(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    },
    onSettled: () => isProcessing.value = false
  })

  const passwordRecoveryContacts = handleSubmit((values) => {
    passwordRecoveryContactsMutation.mutate(values)
  })

  const sendPasswordRecoveryMutation = useMutation({
    mutationFn: api.sendPasswordRecovery,
    onMutate: () => isProcessing.value = true,
    onSuccess: (data) => {
      toast[data.type](data.message)
      startTimer(data.to, identifier.value.toLowerCase(), data.secondsLeft)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as SendPasswordRecoveryResponseErrorDataDto
        if (data.errors) {
          if (data.errors.message) toast.warning(data.errors.message)
          return
        }
        if (error.response?.status === 429) {
          startTimer(data.to, identifier.value.toLowerCase(), data.secondsLeft)
          toast[data.type](data.message)
          return
        }
        toast.error(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    },
    onSettled: () => isProcessing.value = false
  })

  const sendPasswordRecovery = (to: "EMAIL" | "PHONE") => {
    sendPasswordRecoveryMutation.mutate({
      identifier: identifier.value,
      to
    })
  }

  onUnmounted(clearAllTimers)

  return {
    identifierString, onIdentifierInput, identifierClientError, identifierServerError, onIdentifierBlur,
    passwordRecoveryContacts, sendPasswordRecovery,
    step, email, phone, sendPasswordRecoveryEmailCooldown, sendPasswordRecoveryMessageCooldown
  }
}