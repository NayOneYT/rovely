import { useTimer } from "@/shared/composables"
import { useForm, useField } from "vee-validate"
import { useRoute } from "vue-router"
import { toTypedSchema } from "@vee-validate/zod"
import { resetPasswordSchema } from "../auth.schemas"
import { usePasswordField } from "@/shared/composables/fields"
import { useMutation, useQuery } from "@tanstack/vue-query"
import { authApi } from "../auth.api"
import { ApiError } from "@/shared/api/errors"
import { toast } from "vue-sonner"
import { computed, ref, watch } from "vue"
import type { ResetPasswordStatus } from "../auth.types"
import { checkPasswordRecoveryTokenSchema } from "../auth.schemas"

export const useResetPasswordForm = () => {
  const route = useRoute()
  const externalToken = route.params.token as string

  if (externalToken) {
    const urlWithoutToken = window.location.pathname.replace(`/${externalToken}`, '')
    window.history.replaceState(null, "", urlWithoutToken)
  }

  const cooldowns = ref<Record<string, number>>({})
  const { createNewTimer, formattedTime } = useTimer(cooldowns)

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(resetPasswordSchema)
  })

  const {
    value: token
  } = useField<string>("token", undefined, {
    initialValue: externalToken
  })

  const password = usePasswordField()

  const isTokenFormatValid = computed(() => {
    if (!externalToken) return false
    return checkPasswordRecoveryTokenSchema.safeParse({ token: externalToken }).success
  })

  const checkQuery = useQuery({
    queryKey: ["password-recovery-token", externalToken],
    queryFn: () => authApi.checkPasswordRecoveryToken({ token: externalToken }),
    enabled: isTokenFormatValid.value,
    gcTime: 0
  })

  watch(() => checkQuery.data.value?.timeLeftMs, (timeLeftMs) => {
    if (timeLeftMs) createNewTimer(externalToken, timeLeftMs)
  })

  const remainingTime = computed(() => formattedTime(externalToken))

  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onError: (error) => {
      if (!(error instanceof ApiError)) toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const reset = handleSubmit(async (values) => {
    try {
      await resetMutation.mutateAsync(values)
    } catch { }
  })

  const status = computed<ResetPasswordStatus>(() => {
    if (!isTokenFormatValid.value || resetMutation.isError.value) return "TOKEN_INVALID"
    if (checkQuery.isPending.value) return "CHECKING"
    if (checkQuery.isError.value || !formattedTime(externalToken)) return "TOKEN_INVALID"
    if (resetMutation.isPending.value) return "RESETTING"
    if (resetMutation.isSuccess.value) return "SUCCESS"
    return "READY"
  })

  return {
    password,
    status, remainingTime,
    reset
  }
}