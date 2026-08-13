import { useAppField } from "./useAppField"
import { usernameSchema } from "@/shared/schemas"
import type { Ref } from "vue"

export const useUsernameField = (externalValue?: Ref<string>, controlled: boolean = true) => {
  return useAppField({
    name: "username",
    externalValue,
    schema: usernameSchema,
    controlled
  })
}