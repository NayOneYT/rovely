import { cleanDb } from "@/../tests/clean-db.js"
import { botService } from "./bot.service.js"
import { prisma } from "@/shared/prisma.client.js"

describe("botService", () => {
  beforeEach(async () => await cleanDb())

  describe("checkLink", () => {
    it("returns false for a non-existent telegramUserId", async () => {
      await expect(botService.checkLink(telegramUserId)).resolves.toBe(false)
    })

    it("returns true for an existing telegramUserId", async () => {
      await prisma.telegramLink.create({ data: { phone, telegramUserId } })
      await expect(botService.checkLink(telegramUserId)).resolves.toBe(true)
    })
  })

  describe("saveLink", () => {
    it("creates a new telegramLink in the DB on success", async () => {
      await botService.saveLink(phone, telegramUserId)
      await expect(prisma.telegramLink.findUnique({ where: { phone, telegramUserId } })).resolves.toEqual({
        phone,
        telegramUserId
      })
    })
  })
})

const telegramUserId = 1
const phone = "+375291234567"