import { prisma } from "@/prisma/client.js"

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