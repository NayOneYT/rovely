import { Telegraf } from "telegraf"
import { config } from "@/config/index.js"

export const bot = new Telegraf(config.telegramBotToken)