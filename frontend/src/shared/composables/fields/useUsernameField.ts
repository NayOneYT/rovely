import { useAppField } from "./useAppField"
import { usernameSchema } from "@/shared/schemas"

export const useUsernameField = (controlled: boolean = true) => useAppField("username", usernameSchema, controlled)