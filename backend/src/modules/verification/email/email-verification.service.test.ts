import { cleanDb } from "@/../tests/clean-db.js"
import { redis } from "@/shared/redis.client.js"
import { emailVerificationService, buildTokensKey, buildRequestKey } from "./email-verification.service.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import { prisma } from "@/shared/prisma.client.js"
import * as utils from "@/shared/utils/index.js"
import * as mailerService from "@/shared/mailer/mailer.service.js"
import type { EmailVerificationTokenPayload } from "./email-verification.types.js"

describe("emailVerificationService", () => {
  beforeEach(async () => {
    await Promise.all([
      cleanDb(),
      redis.flushdb()
    ])
    vi.spyOn(utils, "generateSecureToken").mockReturnValue(token1)
    vi.spyOn(mailerService, "sendEmail").mockResolvedValue()
  })

  describe("verify", () => {
    it("throws EMAIL_VERIFICATION_REQUEST_NOT_FOUND for a non-existent token", async () => {
      await expect(emailVerificationService.verify({ token: token1 })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.EMAIL_VERIFICATION_REQUEST_NOT_FOUND
      }))
    })

    it("updates email and lowercaseEmail for the provided accountId and deletes its data from Redis", async () => {
      await emailVerificationService.send({ email, name, accountId })
      vi.spyOn(utils, "generateSecureToken").mockReturnValueOnce(token2)
      await Promise.all([
        emailVerificationService.send({ email, name, accountId: undefined }),
        // creating an account has no effect on send method, since we don't specify a email for it
        prisma.account.create({ data: { id: accountId } })
      ])
      await emailVerificationService.verify({ token: token1 })
      await Promise.all([
        expect(prisma.account.findUnique({ where: { id: accountId } })).resolves.toEqual(expect.objectContaining({
          email,
          lowercaseEmail
        })),
        expect(redis.smembers(buildTokensKey(lowercaseEmail))).resolves.toEqual([]),
        expect(redis.get(buildRequestKey(token1))).resolves.toBeNull(),
        expect(redis.get(buildRequestKey(token2))).resolves.toBeNull()
      ])
    })

    it("throws EMAIL_ALREADY_VERIFIED when the email is already verified", async () => {
      await emailVerificationService.send({ email, name, accountId: undefined })
      await emailVerificationService.verify({ token: token1 })
      await expect(emailVerificationService.verify({ token: token1 })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.EMAIL_ALREADY_VERIFIED
      }))
    })

    it("sets isConfirmed to true when accountId isn't provided and updates its data in Redis", async () => {
      await emailVerificationService.send({ email, name, accountId: undefined })
      await emailVerificationService.verify({ token: token1 })
      const rawRequest = await redis.get(buildRequestKey(token1))
      const request: EmailVerificationTokenPayload = JSON.parse(rawRequest!)
      expect(request.isConfirmed).toBe(true)
    })
  })

  describe("checkRegistration", () => {
    it("throws EMAIL_VERIFICATION_REQUEST_NOT_FOUND for a non-existent email", async () => {
      await expect(emailVerificationService.checkRegistration({ email: lowercaseEmail })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.EMAIL_VERIFICATION_REQUEST_NOT_FOUND }))
    })

    it("throws EMAIL_NOT_VERIFIED when the email isn't verified", async () => {
      await emailVerificationService.send({ email, name, accountId: undefined })
      await expect(emailVerificationService.checkRegistration({ email: lowercaseEmail })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.EMAIL_NOT_VERIFIED }))
    })
  })

  describe("send", () => {
    it("throws EMAIL_TAKEN for an existing email", async () => {
      await prisma.account.create({ data: { lowercaseEmail } })
      await expect(emailVerificationService.send({ email, name, accountId })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.EMAIL_TAKEN
      }))
    })

    it("throws EMAIL_ALREADY_VERIFIED when the email is already verified", async () => {
      await emailVerificationService.send({ email, name, accountId: undefined })
      await emailVerificationService.verify({ token: token1 })
      await expect(emailVerificationService.send({ email, name, accountId: undefined })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.EMAIL_ALREADY_VERIFIED })
      )
    })

    it("throws SEND_EMAIL_COOLDOWN with timeLeftMs when resending too soon", async () => {
      await emailVerificationService.send({ email, name, accountId })
      await expect(emailVerificationService.send({ email, name, accountId })).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.SEND_EMAIL_COOLDOWN,
        data: { timeLeftMs: expect.any(Number) }
      }))
    })

    it("deletes old data from Redis on success", async () => {
      await emailVerificationService.send({ email, name, accountId })
      vi.spyOn(redis, "pttl").mockResolvedValueOnce(0)
      vi.spyOn(utils, "generateSecureToken").mockReturnValueOnce(token2)
      await emailVerificationService.send({ email, name, accountId })
      await Promise.all([
        expect(redis.get(buildRequestKey(token1))).resolves.toBeNull(),
        expect(redis.smembers(buildTokensKey(lowercaseEmail))).resolves.not.toContain(token1)
      ])
    })

    it("creates a new request and stores a new token in Redis and returns timeLeftMs on success", async () => {
      const result = await emailVerificationService.send({ email, name, accountId })
      await Promise.all([
        expect(redis.get(buildRequestKey(token1))).resolves.not.toBeNull(),
        expect(redis.smembers(buildTokensKey(lowercaseEmail))).resolves.toContain(token1)
      ])
      expect(result).toEqual({ timeLeftMs: expect.any(Number) })
    })
  })
})

const token1 = "aaaaaaaaaaaaaaaa"
const token2 = "bbbbbbbbbbbbbbbb"
const email = "EMAIL@example.com"
const lowercaseEmail = email.toLowerCase()
const name = ""
const accountId = "account123"