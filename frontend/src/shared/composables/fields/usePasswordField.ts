import { useAppField } from "./useAppField"
import { passwordSchema } from "@/shared/schemas"
import { ref } from "vue"

export const usePasswordField = (controlled: boolean = true) => {
  const field = useAppField("password", passwordSchema, controlled)

  const showPassword = ref(false)

  return { ...field, showPassword }
}