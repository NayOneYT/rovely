import { bot } from "./client.js"

export const sendMessage = async (telegramUserId: number, message: string) => {
  await bot.api.sendMessage(telegramUserId, message, { parse_mode: "HTML" })
}