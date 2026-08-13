import { useAppField } from "./useAppField"
import { phoneSchema } from "@/shared/schemas"
import { AsYouType } from "libphonenumber-js"
import type { Ref } from "vue"

export const usePhoneField = (externalValue?: Ref<string>, controlled: boolean = true) => {
  const field = useAppField({
    name: "phone",
    externalValue,
    schema: phoneSchema,
    controlled
  })

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