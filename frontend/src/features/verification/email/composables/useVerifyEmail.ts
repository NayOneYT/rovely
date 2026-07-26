import { ref } from "vue"
import { useRoute } from "vue-router"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { verifySchema } from "../schema"
import { useMutation } from "@tanstack/vue-query"
import { emailVerificationApi } from "../api"
import { ApiError } from "@/shared/api/types"
import { toast } from "vue-sonner"
import type { VerifyStatus } from "../types"

export const useVerifyEmail = () => {
  const isProcessing = ref<boolean>(false)
  const route = useRoute()
  const externalToken = route.params.token as string

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
    onError: (error) => {
      if (!(error instanceof ApiError)) toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const verify = async (): Promise<VerifyStatus> => {
    try {
      isProcessing.value = true
      const tokenResult = await tokenValidate()
      if (!tokenResult.valid) return "TOKEN_INVALID"
      await verifyMutation.mutateAsync({ token: token.value })
      return "SUCCESS"
    } catch {
      return "TOKEN_INVALID"
    } finally {
      isProcessing.value = false
    }
  }

  return { isProcessing, verify }
}