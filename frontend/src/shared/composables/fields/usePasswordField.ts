import { type Ref, ref } from "vue"
import { useAppField } from "./useAppField"
import { passwordSchema } from "@/shared/schemas"

export const usePasswordField = (externalValue?: Ref<string>, controlled: boolean = true) => {
  const field = useAppField({
    name: "password",
    externalValue,
    schema: passwordSchema,
    controlled
  })

  const showPassword = ref(false)

  return { ...field, showPassword }
}