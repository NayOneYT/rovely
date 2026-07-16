import { bot } from "@/lib/bot.js"
import { prisma } from "@/prisma/client.js"

export const sendMessage = async (telegramUserId: number, message: string) => await bot.api.sendMessage(telegramUserId, message, { parse_mode: "HTML" })

export const telegramLinkService = {
  check: async (telegramUserId: number) => {
    const link = await prisma.telegramLink.findUnique({
      where: {
        telegramUserId
      }
    })
    return !!link
  },

  save: async (phone: string, telegramUserId: number) => {
    await prisma.telegramLink.create({
      data: {
        phone,
        telegramUserId
      }
    })
  }
}