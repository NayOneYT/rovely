import { type Ref, watch } from "vue"
import { useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import type { ZodSchema } from "zod"

export const useAppField = ({
  name,
  externalValue,
  schema,
  controlled = true
}: {
  name: string,
  externalValue?: Ref<any>,
  schema?: ZodSchema,
  controlled?: boolean
}) => {
  const {
    errorMessage: clientError,
    ...field
  } = useField(name, schema ? toTypedSchema(schema) : undefined, {
    validateOnValueUpdate: false,
    initialValue: externalValue?.value,
    controlled
  })

  watch(field.value, (newValue) => {
    if (field.meta.touched) field.validate()
    if (externalValue) externalValue.value = newValue
  })

  const onBlur = () => {
    if (field.meta.dirty) {
      field.handleBlur()
      field.validate()
    }
  }

  return { ...field, clientError, onBlur }
}