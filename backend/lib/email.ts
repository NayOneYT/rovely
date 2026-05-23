import { Resend } from "resend"
import { config } from "@/config/index.js"

export const resend = new Resend(config.resendApiKey)