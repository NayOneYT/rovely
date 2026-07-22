import { Bot } from "grammy"
import { config } from "@/shared/config.js"

export const bot = new Bot(config.botToken)