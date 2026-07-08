import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { resetPasswordSchema } from "../schema"
import { ref, watch } from "vue"
import { useMutation } from "@tanstack/vue-query"
import api from "../api"
import { toast } from "vue-sonner"
import { AxiosError } from "axios"
import type { Ref } from "vue"
import type { ResponseErrorDto } from "@/types"

export const useResetPasswordForm = (rawToken: string, isTokenValid: Ref<boolean>, isProcessing: Ref<boolean>) => {
  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(resetPasswordSchema)
  })

  const {
    value: token,
    validate: tokenValidate
  } = useField<string>("token")

  token.value = rawToken

  const {
    value: password,
    errorMessage: passwordClientError,
    validate: passwordValidate,
    meta: passwordMeta,
    handleBlur: passwordHandleBlur
  } = useField("password", undefined, {
    validateOnValueUpdate: false
  })

  watch(password, () => {
    if (passwordMeta.touched) passwordValidate()
  })

  const onPasswordBlur = () => {
    if (passwordMeta.dirty) {
      passwordHandleBlur()
      passwordValidate()
    }
  }

  const checkPasswordRecoveryTokenMutation = useMutation({
    mutationFn: api.checkPasswordRecoveryToken,
    onSuccess: () => isTokenValid.value = true,
    onSettled: () => isProcessing.value = false
  })

  const checkPasswordRecoveryToken = async () => {
    const tokenResult = await tokenValidate()
    if (!tokenResult.valid) {
      isProcessing.value = false
      return
    }
    checkPasswordRecoveryTokenMutation.mutateAsync(token.value)
  }

  const resetPasswordMutation = useMutation({
    mutationFn: api.resetPassword,
    onMutate: () => isProcessing.value = true,
    onSuccess: () => {
      toast.success("Пароль успешно изменен")
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          isTokenValid.value = false
          return
        }
        toast.error(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    },
    onSettled: () => isProcessing.value = false
  })

  const resetPassword = handleSubmit((values) => {
    resetPasswordMutation.mutate(values)
  })

  return {
    password, passwordClientError, onPasswordBlur,
    checkPasswordRecoveryToken, resetPassword
  }
}