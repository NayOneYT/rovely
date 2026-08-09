import { ref, watch } from "vue"
import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { passwordSchema } from "@/shared/schemas"

export const usePasswordField = (controlled: boolean = true) => {
  const showPassword = ref<boolean>(false)

  const {
    value,
    errorMessage: clientError,
    validate,
    meta,
    handleBlur
  } = useField("password", toTypedSchema(passwordSchema), {
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

  return { value, clientError, onBlur, showPassword }
}