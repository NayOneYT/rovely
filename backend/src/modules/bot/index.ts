import { bot } from "@/shared/bot/bot.client.js"
import { basicComposer } from "./composers/basic.composer.js"

export const registerBotHandlers = () => {
  bot.use(basicComposer)
}