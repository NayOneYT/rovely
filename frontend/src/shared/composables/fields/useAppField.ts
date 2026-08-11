import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { watch } from "vue"
import type { ZodSchema } from "zod"

export const useAppField = (name: string, schema?: ZodSchema, controlled: boolean = true) => {
  const {
    errorMessage: clientError,
    ...field
  } = useField(name, schema ? toTypedSchema(schema) : undefined, {
    validateOnValueUpdate: false,
    controlled
  })

  watch(field.value, () => {
    if (field.meta.touched) field.validate()
  })

  const onBlur = () => {
    if (field.meta.dirty) {
      field.handleBlur()
      field.validate()
    }
  }

  return { ...field, clientError, onBlur }
}