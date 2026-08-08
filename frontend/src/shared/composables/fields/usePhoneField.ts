import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { phoneSchema } from "@/shared/schemas"
import { ref, watch } from "vue"
import { AsYouType } from "libphonenumber-js"

export const usePhoneField = () => {
  const {
    value,
    errorMessage: clientError,
    validate,
    meta,
    handleBlur,
    handleChange
  } = useField("phone", toTypedSchema(phoneSchema), {
    validateOnValueUpdate: false
  })

  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let raw = input.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
    if (raw && !raw.startsWith('+')) raw = '+' + raw
    const formatted = new AsYouType().input(raw)
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

  return { value, clientError, validate, onInput, onBlur }
}