import { useAppField } from "./useAppField"
import { emailSchema } from "@/shared/schemas"
import type { Ref } from "vue"

export const useEmailField = (externalValue?: Ref<string>, controlled: boolean = true) => {
  return useAppField({
    name: "email",
    externalValue,
    schema: emailSchema,
    controlled
  })
}