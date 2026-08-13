import { useAppField } from "./useAppField"
import { nameSchema } from "@/shared/schemas"
import type { Ref } from "vue"

export const useNameField = (externalValue?: Ref<string>, controlled: boolean = true) => {
  return useAppField({
    name: "name",
    externalValue,
    schema: nameSchema,
    controlled
  })
}