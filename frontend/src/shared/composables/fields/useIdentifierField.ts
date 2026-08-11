import { useAppField } from "./useAppField"
import { identifierSchema } from "@/shared/schemas"
import { AsYouType } from "libphonenumber-js"

export const useIdentifierField = () => {
  const field = useAppField("identifier", identifierSchema)

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