import { useAppField } from "./useAppField"
import { loginSchema } from "@/shared/schemas"
import type { Ref } from "vue"

export const useLoginField = (externalValue?: Ref<string>, controlled: boolean = true) => {
  return useAppField({
    name: "login",
    externalValue,
    schema: loginSchema,
    controlled
  })
}