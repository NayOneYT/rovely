import { Bot } from "grammy"
import { config } from "@/config/index.js"
import { basicComposer } from "@/modules/bot/handlers/basic.js"

export const bot = new Bot(config.botToken)

bot.use(basicComposer)