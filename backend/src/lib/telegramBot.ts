import { Bot, Context, session, type SessionFlavor } from "grammy"
import { config } from "@/config/index.js"

interface SessionData {
  isStartWriten: boolean
}

type MyContext = Context & SessionFlavor<SessionData>

export const bot = new Bot<MyContext>(config.telegramBotToken)

bot.use(session({ initial: (): SessionData => ({ isStartWriten: false }) }))