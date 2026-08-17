import { Bot } from "grammy"
import { appConfig } from "@/shared/app.config.js"

export const bot = new Bot(appConfig.botToken)