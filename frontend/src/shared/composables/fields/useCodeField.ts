import { useAppField } from "./useAppField"
import { codeSchema } from "@/shared/schemas"
import type { Ref } from "vue"

export const useCodeField = (externalValue?: Ref<string>, controlled: boolean = true) => {
  const field = useAppField({
    name: "code",
    externalValue,
    schema: codeSchema,
    controlled
  })

  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let formatted = input.value.replace(/\D/g, '')
    input.value = formatted
    field.handleChange(formatted, false)
  }

  return { ...field, onInput }
}