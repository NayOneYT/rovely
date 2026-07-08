import { useForm, useField } from "vee-validate"
import { useRoute } from "vue-router"
import { toTypedSchema } from "@vee-validate/zod"
import { resetPasswordSchema } from "../schema"
import { ref, watch } from "vue"
import { useMutation } from "@tanstack/vue-query"
import api from "../api"
import { toast } from "vue-sonner"
import { AxiosError } from "axios"
import type { ResponseErrorDto } from "@/types"

export const useResetPasswordForm = () => {
  const isTokenValid = ref<boolean>(false)
  const isProcessing = ref<boolean>(true)
  const route = useRoute()

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(resetPasswordSchema)
  })

  const {
    value: token,
    validate: tokenValidate
  } = useField<string>("token")

  token.value = route.params.token as string

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
      isTokenValid.value = false
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
    isTokenValid, isProcessing, checkPasswordRecoveryToken, resetPassword
  }
}