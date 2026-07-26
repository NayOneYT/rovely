import { useForm, useField } from "vee-validate"
import { useRoute } from "vue-router"
import { toTypedSchema } from "@vee-validate/zod"
import { resetPasswordSchema } from "../schema"
import { ref, watch, type Ref } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { authApi } from "../api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { toast } from "vue-sonner"

export const useResetPasswordForm = () => {
  const isProcessing = ref<boolean>(false)
  const isTokenValid = ref<boolean>(false)
  const route = useRoute()
  const externalToken = route.params.token as string

  if (externalToken) {
    const urlWithoutToken = window.location.pathname.replace(`/${externalToken}`, '')
    window.history.replaceState(null, "", urlWithoutToken)
  }

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(resetPasswordSchema)
  })

  const {
    value: token,
    validate: tokenValidate
  } = useField<string>("token", undefined, {
    initialValue: externalToken
  })

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

  const checkMutation = useMutation({
    mutationFn: authApi.checkPasswordRecoveryToken,
    onError: (error) => {
      if (!(error instanceof ApiError)) toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const check = async () => {
    try {
      isProcessing.value = true
      const tokenResult = await tokenValidate()
      if (!tokenResult.valid) return
      await checkMutation.mutateAsync({ token: token.value })
      isTokenValid.value = true
    } catch { } finally {
      isProcessing.value = false
    }
  }

  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success("Пароль изменен")
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const reset = handleSubmit(async (values) => {
    try {
      isProcessing.value = true
      await resetMutation.mutateAsync(values)
    } catch { } finally {
      isTokenValid.value = false
      isProcessing.value = false
    }
  })

  return {
    password, passwordClientError, onPasswordBlur,
    isProcessing, isTokenValid, check, reset
  }
}