import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { nameSchema } from "@/shared/schemas"
import { watch } from "vue"

export const useNameField = () => {
  const {
    value,
    errorMessage: clientError,
    validate,
    meta,
    handleBlur
  } = useField("name", toTypedSchema(nameSchema), {
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