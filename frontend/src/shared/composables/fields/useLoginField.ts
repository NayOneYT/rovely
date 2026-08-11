import { useAppField } from "./useAppField"
import { loginSchema } from "@/shared/schemas"

export const useLoginField = (controlled: boolean = true) => useAppField("login", loginSchema, controlled)