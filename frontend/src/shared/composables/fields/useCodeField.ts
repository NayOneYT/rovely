import { useAppField } from "./useAppField"
import { codeSchema } from "@/shared/schemas"

export const useCodeField = (controlled: boolean = true) => {
  const field = useAppField("code", codeSchema, controlled)

  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let formatted = input.value.replace(/\D/g, '')
    input.value = formatted
    field.handleChange(formatted, false)
  }

  return { ...field, onInput }
}