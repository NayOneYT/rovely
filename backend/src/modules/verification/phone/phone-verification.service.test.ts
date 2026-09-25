import { cleanDb } from "@/../tests/clean-db.js"
import { redis } from "@/shared/redis.client.js"
import { phoneVerificationService, buildRequestKey, buildAccountIdsKey } from "./phone-verification.service.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import { prisma } from "@/shared/prisma.client.js"
import * as utils from "@/shared/utils/index.js"
import * as botService from "@/shared/bot/bot.service.js"
import { GrammyError } from "grammy"
import type { PhoneVerificationRequestPayload } from "./phone-verification.types.js"

describe("phoneVerificationService", () => {
  beforeEach(async () => {
    await Promise.all([
      cleanDb(),
      redis.flushdb()
    ])
    await createTelegramLink()
    vi.spyOn(utils, "generateSecureCode").mockReturnValue(code)
    vi.spyOn(botService, "sendTelegramMessage").mockResolvedValue()
  })

  describe("verify", () => {
    it("throws PHONE_VERIFICATION_REQUEST_NOT_FOUND for a non-existent phone and accountId combination", async () => {
      await expect(phoneVerificationService.verify({ code, phone, accountId })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND })
      )
    })

    it("throws PHONE_ALREADY_VERIFIED when the phone is already verified", async () => {
      await phoneVerificationService.send({ name, phone, accountId: undefined })
      await phoneVerificationService.verify({ code, phone, accountId: undefined })
      await expect(phoneVerificationService.verify({ code, phone, accountId: undefined })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.PHONE_ALREADY_VERIFIED })
      )
    })

    it("throws PHONE_VERIFICATION_CODE_INVALID for an incorrect code", async () => {
      await phoneVerificationService.send({ name, phone, accountId })
      await expect(phoneVerificationService.verify({ code: incorrectCode, phone, accountId })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.PHONE_VERIFICATION_CODE_INVALID })
      )
    })

    it("sets isConfirmed to true when accountId isn't provided and updates its data in Redis", async () => {
      await phoneVerificationService.send({ name, phone, accountId: undefined })
      await phoneVerificationService.verify({ code, phone, accountId: undefined })
      const rawRequest = await redis.get(buildRequestKey(phone, undefined))
      const request: PhoneVerificationRequestPayload = JSON.parse(rawRequest!)
      expect(request.isConfirmed).toBe(true)
    })

    it("updates phone for the provided accountId and deletes its data from Redis", async () => {
      // creating an account has no effect on send method, since we don't specify a phone for it
      await Promise.all([
        prisma.account.create({ data: { id: accountId } }),
        phoneVerificationService.send({ name, phone, accountId }),
        phoneVerificationService.send({ name, phone, accountId: undefined })
      ])
      await phoneVerificationService.verify({ code, phone, accountId })
      await Promise.all([
        expect(prisma.account.findUnique({ where: { id: accountId } })).resolves.toEqual(expect.objectContaining({
          phone
        })),
        expect(redis.smembers(buildAccountIdsKey(phone))).resolves.toEqual([]),
        expect(redis.get(buildRequestKey(phone, accountId))).resolves.toBeNull(),
        expect(redis.get(buildRequestKey(phone, undefined))).resolves.toBeNull()
      ])
    })
  })

  describe("checkRegistration", () => {
    it("throws PHONE_VERIFICATION_REQUEST_NOT_FOUND for a non-existent phone", async () => {
      await expect(phoneVerificationService.checkRegistration({ phone })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND
      }))
    })

    it("throws PHONE_NOT_VERIFIED when the phone isn't verified", async () => {
      await phoneVerificationService.send({ name, phone, accountId: undefined })
      await expect(phoneVerificationService.checkRegistration({ phone })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.PHONE_NOT_VERIFIED
      }))
    })
  })

  describe("send", () => {
    it("throws PHONE_TAKEN for an existing phone", async () => {
      await prisma.account.create({ data: { phone } })
      await expect(phoneVerificationService.send({ name, phone, accountId })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.PHONE_TAKEN
      }))
    })

    it("throws TELEGRAM_LINK_NOT_FOUND for a non-existent telegramLink", async () => {
      await prisma.telegramLink.delete({ where: { phone } })
      await expect(phoneVerificationService.send({ name, phone, accountId })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.TELEGRAM_LINK_NOT_FOUND
      }))
    })

    it("throws SEND_TELEGRAM_MESSAGE_COOLDOWN with timeLeftMs when resending too soon", async () => {
      await phoneVerificationService.send({ name, phone, accountId })
      await expect(phoneVerificationService.send({ name, phone, accountId })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN,
        data: { timeLeftMs: expect.any(Number) }
      }))
    })

    it("throws PHONE_ALREADY_VERIFIED when the phone is already verified", async () => {
      await phoneVerificationService.send({ name, phone, accountId: undefined })
      await phoneVerificationService.verify({ code, phone, accountId: undefined })
      await expect(phoneVerificationService.send({ name, phone, accountId: undefined })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.PHONE_ALREADY_VERIFIED })
      )
    })

    it("converts a GrammyError with code 403 to TELEGRAM_BOT_BLOCKED", async () => {
      vi.spyOn(botService, "sendTelegramMessage").mockRejectedValue(new GrammyError(
        "message",
        { ok: false, error_code: 403, description: "" },
        "method",
        {}
      ))
      await expect(phoneVerificationService.send({ name, phone, accountId })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.TELEGRAM_BOT_BLOCKED
      }))
    })

    it("creates a new request and stores accountId in Redis and returns timeLeftMs on success", async () => {
      const result = await phoneVerificationService.send({ name, phone, accountId })
      await Promise.all([
        expect(redis.get(buildRequestKey(phone, accountId))).resolves.not.toBeNull(),
        expect(redis.smembers(buildAccountIdsKey(phone))).resolves.toEqual(expect.arrayContaining([accountId]))
      ])
      expect(result).toEqual({ timeLeftMs: expect.any(Number) })
    })
  })
})

const code = "123456"
const incorrectCode = "111111"
const phone = "+375291234567"
const accountId = "account123"
const name = ""

const createTelegramLink = async () => await prisma.telegramLink.create({ data: { phone, telegramUserId: 1 } })