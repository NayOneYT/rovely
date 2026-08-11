import { useAppField } from "./useAppField"
import { emailSchema } from "@/shared/schemas"

export const useEmailField = (controlled: boolean = true) => useAppField("email", emailSchema, controlled)