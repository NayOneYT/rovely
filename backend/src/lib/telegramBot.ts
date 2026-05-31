import { Bot } from "grammy"
import { config } from "@/config/index.js"

export const bot = new Bot(config.telegramBotToken)