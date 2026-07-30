import { useForm, useField } from "vee-validate"
import { useRoute } from "vue-router"
import { toTypedSchema } from "@vee-validate/zod"
import { resetPasswordSchema } from "../schema"
import { ref, watch } from "vue"
import { useMutation } from "@tanstack/vue-query"
import { authApi } from "../api"
import { ApiError } from "@/shared/api/types"
import { toast } from "vue-sonner"
import type { ResetPasswordStatus } from "../types"

export const useResetPasswordForm = () => {
  const route = useRoute()
  const externalToken = route.params.token as string
  const status = ref<ResetPasswordStatus>("CHECKING")

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
      const tokenResult = await tokenValidate()
      if (!tokenResult.valid) {
        status.value = "TOKEN_INVALID"
        return
      }
      await checkMutation.mutateAsync({ token: token.value })
      status.value = "READY"
    } catch {
      status.value = "TOKEN_INVALID"
    }
  }

  check()

  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onError: (error) => {
      if (!(error instanceof ApiError)) toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const reset = handleSubmit(async (values) => {
    try {
      status.value = "RESETTING"
      await resetMutation.mutateAsync(values)
      status.value = "SUCCESS"
    } catch {
      status.value = "TOKEN_INVALID"
    }
  })

  return {
    password, passwordClientError, onPasswordBlur,
    status, reset
  }
}