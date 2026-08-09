import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { usernameSchema } from "@/shared/schemas"
import { watch } from "vue"

export const useUsernameField = () => {
  const {
    value,
    errorMessage: clientError,
    validate,
    meta,
    handleBlur
  } = useField("username", toTypedSchema(usernameSchema), {
    validateOnValueUpdate: false
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