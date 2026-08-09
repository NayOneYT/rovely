import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { emailSchema } from "@/shared/schemas"
import { watch } from "vue"

export const useEmailField = (controlled: boolean = true) => {
  const {
    value,
    errorMessage: clientError,
    validate,
    meta,
    handleBlur
  } = useField("email", toTypedSchema(emailSchema), {
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

  return { value, clientError, validate, onBlur }
}