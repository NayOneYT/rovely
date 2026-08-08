import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { identifierSchema } from "@/shared/schemas"
import { ref, watch } from "vue"
import { AsYouType } from "libphonenumber-js"

export const useIdentifierField = () => {
  const {
    errorMessage: clientError,
    validate,
    meta,
    handleBlur,
    handleChange
  } = useField<string>("identifier", toTypedSchema(identifierSchema), {
    validateOnValueUpdate: false
  })

  const formattedString = ref<string>()
  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.value.startsWith("+")) {
      formattedString.value = input.value
      handleChange(input.value, false)
      return
    }
    let raw = input.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
    const formatted = new AsYouType().input(raw)
    formattedString.value = formatted
    handleChange(formatted, false)
  }

  watch(formattedString, () => {
    if (meta.touched) validate()
  })

  const onBlur = () => {
    if (meta.dirty) {
      handleBlur()
      validate()
    }
  }

  return { formattedString, clientError, onInput, onBlur }
}