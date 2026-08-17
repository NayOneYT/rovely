import { ref } from "vue"
import { useRoute } from "vue-router"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { verifySchema } from "../email-verification.schemas"
import { useMutation } from "@tanstack/vue-query"
import { emailVerificationApi } from "../email-verification.api"
import { ApiError, ErrorCode } from "@/shared/api/errors"
import { toast } from "vue-sonner"
import type { VerifyStatus } from "../email-verification.types"

export const useVerifyEmail = () => {
  const route = useRoute()
  const externalToken = route.params.token as string
  const status = ref<VerifyStatus>("IDLE")

  if (externalToken) {
    const urlWithoutToken = window.location.pathname.replace(`/${externalToken}`, '')
    window.history.replaceState(null, "", urlWithoutToken)
  }

  useForm({
    validationSchema: toTypedSchema(verifySchema)
  })

  const {
    value: token,
    validate: tokenValidate
  } = useField<string>("token", undefined, {
    initialValue: externalToken
  })

  const verifyMutation = useMutation({
    mutationFn: emailVerificationApi.verify,
    onSuccess: () => status.value = "SUCCESS",
    onError: (error) => {
      if (!(error instanceof ApiError)) toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const verify = async () => {
    try {
      const tokenResult = await tokenValidate()
      if (!tokenResult.valid) {
        status.value = "TOKEN_INVALID"
        return
      }
      await verifyMutation.mutateAsync({ token: token.value })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === ErrorCode.EMAIL_ALREADY_VERIFIED) status.value = "ALREADY_VERIFIED"
        else status.value = "TOKEN_INVALID"
      }
    }
  }

  verify()

  return { status }
}