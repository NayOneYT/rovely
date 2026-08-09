import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { loginSchema } from "@/shared/schemas"
import { watch } from "vue"

export const useLoginField = (controlled: boolean = true) => {
  const {
    value,
    errorMessage: clientError,
    validate,
    meta,
    handleBlur
  } = useField("login", toTypedSchema(loginSchema), {
    validateOnValueUpdate: false,
    controlled
  })

  watch(value, () => {
    if (meta.touched) validate()
  })

  const onBlur = () => {
    if (meta.dirty) {
      handleBlur()
      validate()
    }
  }

  return { value, clientError, onBlur }
}