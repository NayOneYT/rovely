import { Resend } from "resend"
import { appConfig } from "@/shared/app.config.js"

export const resend = new Resend(appConfig.resendApiKey)