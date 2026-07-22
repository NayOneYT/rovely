import { bot } from "@/shared/bot/client.js"
import { basicComposer } from "./handlers/basic.js"

export const registerBotHandlers = () => {
  bot.use(basicComposer)
}