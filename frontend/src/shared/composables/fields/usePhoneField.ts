import { useAppField } from "./useAppField"
import { phoneSchema } from "@/shared/schemas"
import { AsYouType } from "libphonenumber-js"

export const usePhoneField = (controlled: boolean = true) => {
  const field = useAppField("phone", phoneSchema, controlled)

  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let raw = input.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
    if (raw && !raw.startsWith('+')) raw = '+' + raw
    const formatted = new AsYouType().input(raw)
    input.value = formatted
    field.handleChange(formatted, false)
  }

  return { ...field, onInput }
}