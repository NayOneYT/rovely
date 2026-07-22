import { Resend } from "resend"
import { config } from "@/shared/config.js"

export const resend = new Resend(config.resendApiKey)