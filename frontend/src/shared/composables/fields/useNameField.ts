import { useAppField } from "./useAppField"
import { nameSchema } from "@/shared/schemas"

export const useNameField = (controlled: boolean = true) => useAppField("name", nameSchema, controlled)