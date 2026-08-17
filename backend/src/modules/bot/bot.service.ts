import { prisma } from "@/shared/prisma.client.js"

export const botService = {
  checkLink: async (telegramUserId: number) => {
    const link = await prisma.telegramLink.findUnique({
      where: {
        telegramUserId
      }
    })
    return !!link
  },

  saveLink: async (phone: string, telegramUserId: number) => {
    await prisma.telegramLink.create({
      data: {
        phone,
        telegramUserId
      }
    })
  }
}