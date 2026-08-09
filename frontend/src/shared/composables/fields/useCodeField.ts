import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { codeSchema } from "../../schemas"
import { watch } from "vue"

export const useCodeField = (controlled: boolean = true) => {
  const {
    value,
    errorMessage: clientError,
    validate,
    meta,
    handleBlur,
    handleChange,
    setErrors
  } = useField("code", toTypedSchema(codeSchema), {
    validateOnValueUpdate: false,
    controlled
  })

  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let formatted = input.value.replace(/\D/g, '')
    input.value = formatted
    handleChange(formatted, false)
  }

  watch(value, () => {
    if (meta.touched) validate()
  })

  const onBlur = () => {
    if (meta.dirty) {
      handleBlur()
      validate()
    }
  }

  return { value, clientError, validate, setErrors, onInput, onBlur }
}