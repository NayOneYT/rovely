import { useAppField } from "./useAppField"
import { identifierSchema } from "@/shared/schemas"
import { AsYouType } from "libphonenumber-js"
import type { Ref } from "vue"

export const useIdentifierField = (externalValue?: Ref<string>, controlled: boolean = true) => {
  const field = useAppField({
    name: "identifier",
    externalValue,
    schema: identifierSchema,
    controlled
  })

  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.value.startsWith("+")) {
      field.handleChange(input.value, false)
      return
    }
    let raw = input.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
    const formatted = new AsYouType().input(raw)
    input.value = formatted
    field.handleChange(formatted, false)
  }

  return { ...field, onInput }
}