import { cleanDb } from "@/../tests/clean-db.js"
import { redis } from "@/shared/redis.client.js"
import jwt from "jsonwebtoken"
import {
  authService, generateRefreshToken, hashPassword, buildLoginWithPhoneKey, buildPasswordRecoveryTokenKey,
  buildPasswordRecoveryRequestKey, generateUniqueUsername
} from "./auth.service.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import { prisma } from "@/shared/prisma.client.js"
import * as botService from "@/shared/bot/bot.service.js"
import * as mailerService from "@/shared/mailer/mailer.service.js"
import { GrammyError } from "grammy"
import * as utils from "@/shared/utils/index.js"
import {
  emailVerificationService, buildRequestKey as buildEmailVerificationRequestKey, buildTokensKey
} from "../verification/email/email-verification.service.js"
import {
  phoneVerificationService, buildAccountIdsKey, buildRequestKey as buildPhoneVerificationRequestKey
} from "../verification/phone/phone-verification.service.js"
import { googleClient } from "./google.client.js"
import * as usernameGenerator from "unique-username-generator"
import type { RefreshTokenPayload } from "@/shared/types/jwt.types.js"
import type {
  LoginDto, SendLoginWithPhoneDto, LoginWithPhoneDto, RegisterDto, GoogleAuthDto, PasswordRecoveryContactsDto,
  SendPasswordRecoveryDto, CheckPasswordRecoveryTokenDto, ResetPasswordDto
} from "./auth.schemas.js"
import type { SendParams as SendEmailVerificationParams } from "../verification/email/email-verification.types.js"
import type { VerifyDto as VerifyEmailDto } from "../verification/email/email-verification.schemas.js"
import type {
  SendParams as SendPhoneVerificationParams, VerifyParams as VerifyPhoneParams
} from "../verification/phone/phone-verification.types.js"
import type { GetTokenResponse } from "google-auth-library/build/src/auth/oauth2client.js"
import type { LoginTicket } from "google-auth-library"

describe("authService", () => {
  beforeEach(async () => {
    await Promise.all([
      cleanDb(),
      redis.flushdb()
    ])
    vi.spyOn(botService, "sendTelegramMessage").mockResolvedValue()
    vi.spyOn(mailerService, "sendEmail").mockResolvedValue()
  })

  describe("refresh", () => {
    it("throws REFRESH_TOKEN_EXPIRED when the refreshToken is expired", async () => {
      vi.spyOn(jwt, "verify").mockThrow(new jwt.TokenExpiredError("", new Date()))
      await expect(authService.refresh("")).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.REFRESH_TOKEN_EXPIRED
      }))
    })

    it("throws REFRESH_TOKEN_INVALID for an incorrect refreshToken", async () => {
      vi.spyOn(jwt, "verify").mockThrow(new jwt.JsonWebTokenError(""))
      await expect(authService.refresh("")).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.REFRESH_TOKEN_INVALID
      }))
    })

    it("throws ACCOUNT_NOT_FOUND for a non-existent ID", async () => {
      vi.spyOn(jwt, "verify").mockReturnValue(createRefreshTokenPayload(0) as any)
      await expect(authService.refresh("")).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.ACCOUNT_NOT_FOUND
      }))
    })

    it("throws REFRESH_TOKEN_INVALID when the password has been changed", async () => {
      const now = new Date()
      vi.spyOn(jwt, "verify").mockReturnValue(createRefreshTokenPayload(now.getDate() - 1) as any)
      await prisma.account.create({ data: { id: accountId, passwordChangedAt: now } })
      await expect(authService.refresh("")).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.REFRESH_TOKEN_INVALID
      }))
    })

    it("returns new auth tokens and rememberMe on success", async () => {
      const refreshTokenPayload = createRefreshTokenPayload(0)
      vi.spyOn(jwt, "verify").mockReturnValue(refreshTokenPayload as any)
      await prisma.account.create({ data: { id: accountId } })
      const refreshToken = generateRefreshToken(refreshTokenPayload)
      await expect(authService.refresh(refreshToken)).resolves.toEqual({
        accessToken: expect.any(String),
        newRefreshToken: expect.any(String),
        rememberMe: expect.any(Boolean)
      })
    })

    const accountId = "account123"
    const createRefreshTokenPayload = (passwordChangedAt: number): RefreshTokenPayload => {
      return { id: accountId, rememberMe: false, passwordChangedAt }
    }
  })

  describe("login", () => {
    it("throws ACCOUNT_NOT_FOUND for a non-existent identifier", async () => {
      await expect(authService.login(createLoginDto())).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.ACCOUNT_NOT_FOUND
      }))
    })

    it("throws PASSWORD_NOT_SET when the account has no password", async () => {
      await prisma.account.create({ data: { phone } })
      await expect(authService.login(createLoginDto())).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.PASSWORD_NOT_SET
      }))
    })

    it("throws PASSWORD_INVALID for an incorrect password", async () => {
      const hashedPassword = await hashPassword(password)
      await prisma.account.create({ data: { phone, password: hashedPassword } })
      await expect(authService.login(createLoginDto(""))).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.PASSWORD_INVALID
      }))
    })

    it("returns auth tokens on success", async () => {
      const hashedPassword = await hashPassword(password)
      await prisma.account.create({ data: { phone, password: hashedPassword } })
      await expect(authService.login(createLoginDto())).resolves.toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String)
      })
    })

    const phone = "+375291234567"
    const password = "123456"
    const createLoginDto = (externalPassword: string = password): LoginDto => {
      return { identifier: phone, password: externalPassword, rememberMe: false }
    }
  })

  describe("sendLoginWithPhone", () => {
    beforeEach(async () => await Promise.all([
      prisma.account.create({
        data: {
          phone,
          profile: { create: { username: "", lowercaseUsername: "", name: "" } }
        }
      }),
      prisma.telegramLink.create({ data: { phone, telegramUserId: 1 } })
    ]))

    it("throws ACCOUNT_NOT_FOUND for a non-existent phone", async () => {
      await expect(authService.sendLoginWithPhone(createSendLoginWithPhoneDto(""))).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.ACCOUNT_NOT_FOUND })
      )
    })

    it("throws SEND_TELEGRAM_MESSAGE_COOLDOWN with timeLeftMs when resending too soon", async () => {
      await authService.sendLoginWithPhone(createSendLoginWithPhoneDto())
      await expect(authService.sendLoginWithPhone(createSendLoginWithPhoneDto())).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN,
          data: { timeLeftMs: expect.any(Number) }
        })
      )
    })

    it("converts a GrammyError with code 403 to TELEGRAM_BOT_BLOCKED", async () => {
      vi.spyOn(botService, "sendTelegramMessage").mockThrow(new GrammyError(
        "message",
        { ok: false, error_code: 403, description: "" },
        "method",
        {}
      ))
      await expect(authService.sendLoginWithPhone(createSendLoginWithPhoneDto())).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.TELEGRAM_BOT_BLOCKED })
      )
    })

    it("creates a new record in Redis and returns timeLeftMs on success", async () => {
      const result = await authService.sendLoginWithPhone(createSendLoginWithPhoneDto())
      expect(result).toEqual({ timeLeftMs: expect.any(Number) })
      await expect(redis.get(buildLoginWithPhoneKey(phone))).resolves.not.toBeNull()
    })

    const phone = "+375291234567"
    const createSendLoginWithPhoneDto = (externalPhone: string = phone): SendLoginWithPhoneDto => {
      return { phone: externalPhone }
    }
  })

  describe("loginWithPhone", () => {
    beforeEach(async () => {
      await Promise.all([
        prisma.account.create({
          data: {
            phone,
            profile: { create: { username: "", lowercaseUsername: "", name: "" } }
          }
        }),
        prisma.telegramLink.create({ data: { phone, telegramUserId: 1 } })
      ])
      vi.spyOn(utils, "generateSecureCode").mockReturnValue(code)
    })

    it("throws ACCOUNT_NOT_FOUND for a non-existent phone", async () => {
      await expect(authService.loginWithPhone(createLoginWithPhoneDto(""))).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.ACCOUNT_NOT_FOUND
      }))
    })

    it("throws LOGIN_WITH_PHONE_REQUEST_NOT_FOUND when there is no request for this phone", async () => {
      await expect(authService.loginWithPhone(createLoginWithPhoneDto())).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.LOGIN_WITH_PHONE_REQUEST_NOT_FOUND
      }))
    })

    it("throws LOGIN_WITH_PHONE_CODE_INVALID for an incorrect code", async () => {
      await authService.sendLoginWithPhone({ phone })
      await expect(authService.loginWithPhone(createLoginWithPhoneDto(undefined, ""))).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.LOGIN_WITH_PHONE_CODE_INVALID })
      )
    })

    it("deletes the code from Redis and returns auth tokens on success", async () => {
      await authService.sendLoginWithPhone({ phone })
      await expect(authService.loginWithPhone(createLoginWithPhoneDto())).resolves.toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String)
      })
      await expect(redis.get(buildLoginWithPhoneKey(phone))).resolves.toBeNull()
    })

    const phone = "+375291234567"
    const code = "123456"
    const createLoginWithPhoneDto = (externalPhone: string = phone, externalCode: string = code): LoginWithPhoneDto => {
      return { phone: externalPhone, code: externalCode, rememberMe: false }
    }
  })

  describe("checkAvailability", () => {
    beforeEach(async () => await prisma.account.create({
      data: {
        email, lowercaseEmail, phone, login,
        profile: { create: { username, lowercaseUsername, name: "" } }
      }
    }))

    it("throws USERNAME_TAKEN for an existing username", async () => {
      await expect(authService.checkAvailability({ field: "username", value: lowercaseUsername })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.USERNAME_TAKEN })
      )
    })

    it("throws EMAIL_TAKEN for an existing email", async () => {
      await expect(authService.checkAvailability({ field: "email", value: lowercaseEmail })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.EMAIL_TAKEN })
      )
    })

    it("throws PHONE_TAKEN for an existing phone", async () => {
      await expect(authService.checkAvailability({ field: "phone", value: phone })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.PHONE_TAKEN })
      )
    })

    it("throws LOGIN_TAKEN for an existing login", async () => {
      await expect(authService.checkAvailability({ field: "login", value: login })).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.LOGIN_TAKEN })
      )
    })

    const username = "USERNAME"
    const lowercaseUsername = username.toLowerCase()
    const email = "EMAIL@example.com"
    const lowercaseEmail = email.toLowerCase()
    const phone = "+375291234567"
    const login = "login"
  })

  describe("register", () => {
    it("throws USERNAME_TAKEN for an existing username", async () => {
      await prisma.account.create({
        data: {
          profile: {
            create: {
              username, lowercaseUsername, name
            }
          }
        }
      })
      await expect(authService.register(registerDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.USERNAME_TAKEN
      }))
    })

    it("throws EMAIL_TAKEN for an existing email", async () => {
      await prisma.account.create({
        data: {
          email, lowercaseEmail,
          profile: {
            create: {
              username: "", lowercaseUsername: "", name
            }
          }
        }
      })
      await expect(authService.register(registerDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.EMAIL_TAKEN
      }))
    })

    it("throws PHONE_TAKEN for an existing phone", async () => {
      await prisma.account.create({
        data: {
          phone,
          profile: {
            create: {
              username: "", lowercaseUsername: "", name
            }
          }
        }
      })
      await expect(authService.register(registerDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.PHONE_TAKEN
      }))
    })

    it("throws LOGIN_TAKEN for an existing login", async () => {
      await prisma.account.create({
        data: {
          login,
          profile: {
            create: {
              username: "", lowercaseUsername: "", name
            }
          }
        }
      })
      await expect(authService.register(registerDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.LOGIN_TAKEN
      }))
    })

    it("throws EMAIL_VERIFICATION_REQUEST_NOT_FOUND or EMAIL_NOT_VERIFIED when the email verification check fails", async () => {
      await expect(authService.register(registerDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.EMAIL_VERIFICATION_REQUEST_NOT_FOUND
      }))
      await emailVerificationService.send(sendEmailVerificationParams)
      await expect(authService.register(registerDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.EMAIL_NOT_VERIFIED
      }))
    })

    it("throws PHONE_VERIFICATION_REQUEST_NOT_FOUND or PHONE_NOT_VERIFIED when the phone verification check fails", async () => {
      vi.spyOn(utils, "generateSecureToken").mockReturnValue(token)
      await Promise.all([
        emailVerificationService.send(sendEmailVerificationParams),
        prisma.telegramLink.create({ data: { phone, telegramUserId: 1 } })
      ])
      await emailVerificationService.verify(verifyEmailDto)
      await expect(authService.register(registerDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND
      }))
      await phoneVerificationService.send(sendPhoneVerificationParams)
      await expect(authService.register(registerDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.PHONE_NOT_VERIFIED
      }))
    })

    it("creates an account in the DB and deletes the verification data from Redis on success", async () => {
      vi.spyOn(utils, "generateSecureToken").mockReturnValue(token)
      vi.spyOn(utils, "generateSecureCode").mockReturnValue(code)
      await Promise.all([
        emailVerificationService.send(sendEmailVerificationParams),
        prisma.telegramLink.create({ data: { phone, telegramUserId: 1 } })
      ])
      await Promise.all([
        emailVerificationService.verify(verifyEmailDto),
        phoneVerificationService.send(sendPhoneVerificationParams)
      ])
      await phoneVerificationService.verify(verifyPhoneParams)
      await authService.register(registerDto)
      await Promise.all([
        expect(prisma.account.findUnique({ where: { lowercaseEmail } })).resolves.not.toBeNull(),
        expect(redis.get(buildEmailVerificationRequestKey(token))).resolves.toBeNull(),
        expect(redis.smembers(buildTokensKey(lowercaseEmail))).resolves.toEqual([]),
        expect(redis.smembers(buildAccountIdsKey(phone))).resolves.toEqual([]),
        expect(redis.get(buildPhoneVerificationRequestKey(phone, undefined))).resolves.toBeNull()
      ])
    })

    const username = "USERNAME"
    const lowercaseUsername = username.toLowerCase()
    const email = "EMAIL@example.com"
    const lowercaseEmail = email.toLowerCase()
    const name = ""
    const phone = "+375291234567"
    const login = "login"
    const registerDto: RegisterDto = {
      password: "123456",
      phone,
      username,
      email,
      login,
      name
    }
    const sendEmailVerificationParams: SendEmailVerificationParams = { email, name, accountId: undefined }
    const sendPhoneVerificationParams: SendPhoneVerificationParams = { phone, name, accountId: undefined }
    const token = "aaaaaaaaaaaaaaaa"
    const verifyEmailDto: VerifyEmailDto = { token }
    const code = "123456"
    const verifyPhoneParams: VerifyPhoneParams = { phone, code, accountId: undefined }
  })

  describe("google", () => {
    beforeEach(() => {
      vi.spyOn(googleClient, "getToken").mockImplementation(() => ({ tokens: { id_token: "token" } }))
      vi.spyOn(googleClient, "verifyIdToken").mockImplementation(() => {
        return { getPayload: () => ({ email, sub: googleId, name: "name" }) } as LoginTicket
      })
    })

    it("throws GOOGLE_AUTH_FAILED when Google doesn't return id_token", async () => {
      vi.spyOn(googleClient, "getToken").mockImplementation(() => ({ tokens: {} }) as GetTokenResponse)
      await expect(authService.google(googleAuthDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.GOOGLE_AUTH_FAILED
      }))
    })

    it("throws GOOGLE_AUTH_FAILED when the ticket hasn't payload", async () => {
      vi.spyOn(googleClient, "verifyIdToken").mockImplementation(() => ({ getPayload: () => { } }) as LoginTicket)
      await expect(authService.google(googleAuthDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.GOOGLE_AUTH_FAILED
      }))
    })

    it("throws GOOGLE_AUTH_FAILED when the payload hasn't email", async () => {
      vi.spyOn(googleClient, "verifyIdToken").mockImplementation(() => {
        return { getPayload: () => ({ email: undefined }) as unknown as LoginTicket }
      })
      await expect(authService.google(googleAuthDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.GOOGLE_AUTH_FAILED
      }))
    })

    it("creates an account for this email and deletes its verification data from Redis", async () => {
      const token = "aaaaaaaaaaaaaaaa"
      vi.spyOn(utils, "generateSecureToken").mockReturnValue(token)
      await emailVerificationService.send({ email, name: "", accountId: undefined })
      await authService.google(googleAuthDto)
      await Promise.all([
        expect(prisma.account.findUnique({ where: { lowercaseEmail } })).resolves.not.toBeNull(),
        expect(redis.get(buildEmailVerificationRequestKey(token))).resolves.toBeNull(),
        expect(redis.smembers(buildTokensKey(lowercaseEmail))).resolves.toEqual([]),
      ])
    })

    it("links the Google ID to an existing email", async () => {
      await prisma.account.create({ data: { email, lowercaseEmail } })
      await authService.google(googleAuthDto)
      await expect(prisma.account.findUnique({ where: { lowercaseEmail } })).resolves.toEqual(expect.objectContaining({
        googleId
      }))
    })

    it("returns auth tokens and the isNewAccount on success", async () => {
      await expect(authService.google(googleAuthDto)).resolves.toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        isNewAccount: expect.any(Boolean)
      })
    })

    const googleAuthDto: GoogleAuthDto = { code: "code" }
    const email = "EMAIL@example.com"
    const lowercaseEmail = email.toLowerCase()
    const googleId = "123"
  })

  describe("getPasswordRecoveryContacts", () => {
    it("throws ACCOUNT_NOT_FOUND for a non-existent identifier", async () => {
      await expect(authService.getPasswordRecoveryContacts(createPasswordRecoveryContactsDto(phone))).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.ACCOUNT_NOT_FOUND })
      )
    })

    it("returns a blurred email when linked", async () => {
      await prisma.account.create({ data: { email, lowercaseEmail } })
      await expect(authService.getPasswordRecoveryContacts(createPasswordRecoveryContactsDto(lowercaseEmail))).resolves.toEqual(
        expect.objectContaining({ email: expect.any(String) })
      )
    })

    it("returns a blurred phone when linked", async () => {
      await prisma.account.create({ data: { phone } })
      await expect(authService.getPasswordRecoveryContacts(createPasswordRecoveryContactsDto(phone))).resolves.toEqual(
        expect.objectContaining({ phone: expect.any(String) })
      )
    })

    const createPasswordRecoveryContactsDto = (identifier: string): PasswordRecoveryContactsDto => ({ identifier })
    const email = "EMAIL@example.com"
    const lowercaseEmail = email.toLowerCase()
    const phone = "+375291234567"
  })

  describe("sendPasswordRecovery", () => {
    it("throws ACCOUNT_NOT_FOUND for a non-existent identifier", async () => {
      await expect(authService.sendPasswordRecovery(createSendPasswordRecoveryDto(lowercaseEmail, "EMAIL"))).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.ACCOUNT_NOT_FOUND })
      )
    })

    it("throws EMAIL_NOT_LINKED when an email isn't linked", async () => {
      await createAccount("phone")
      await expect(authService.sendPasswordRecovery(createSendPasswordRecoveryDto(phone, "EMAIL"))).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.EMAIL_NOT_LINKED })
      )
    })

    it("throws PHONE_NOT_LINKED when a phone isn't linked", async () => {
      await createAccount("email")
      await expect(authService.sendPasswordRecovery(createSendPasswordRecoveryDto(lowercaseEmail, "PHONE"))).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.PHONE_NOT_LINKED })
      )
    })

    it("throws SEND_EMAIL_COOLDOWN when resending to the email too soon", async () => {
      await createAccount("email")
      await authService.sendPasswordRecovery(createSendPasswordRecoveryDto(lowercaseEmail, "EMAIL"))
      await expect(authService.sendPasswordRecovery(createSendPasswordRecoveryDto(lowercaseEmail, "EMAIL"))).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.SEND_EMAIL_COOLDOWN })
      )
    })

    it("throws SEND_TELEGRAM_MESSAGE_COOLDOWN when resending to the phone too soon", async () => {
      await Promise.all([createAccount("phone"), createTelegramLink()])
      await authService.sendPasswordRecovery(createSendPasswordRecoveryDto(phone, "PHONE"))
      await expect(authService.sendPasswordRecovery(createSendPasswordRecoveryDto(phone, "PHONE"))).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN })
      )
    })

    it("deletes the old request from Redis for an existing token", async () => {
      await createAccount("email", accountId)
      vi.spyOn(utils, "generateSecureToken").mockReturnValueOnce(token)
      await authService.sendPasswordRecovery(createSendPasswordRecoveryDto(lowercaseEmail, "EMAIL"))
      vi.spyOn(redis, "pttl").mockResolvedValueOnce(0)
      await authService.sendPasswordRecovery(createSendPasswordRecoveryDto(lowercaseEmail, "EMAIL"))
      await expect(redis.get(buildPasswordRecoveryTokenKey(accountId, "EMAIL"))).resolves.not.toBe(token)
      await expect(redis.get(buildPasswordRecoveryRequestKey(token))).resolves.toBeNull()
    })

    it("converts a GrammyError with code 403 to TELEGRAM_BOT_BLOCKED", async () => {
      await Promise.all([createAccount("phone"), createTelegramLink()])
      vi.spyOn(botService, "sendTelegramMessage").mockThrow(new GrammyError(
        "message",
        { ok: false, error_code: 403, description: "" },
        "method",
        {}
      ))
      await expect(authService.sendPasswordRecovery(createSendPasswordRecoveryDto(phone, "PHONE"))).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.TELEGRAM_BOT_BLOCKED })
      )
    })

    it("creates a new request and token in Redis and returns timeLeftMs on success", async () => {
      await createAccount("email", accountId)
      vi.spyOn(utils, "generateSecureToken").mockReturnValue(token)
      await expect(authService.sendPasswordRecovery(createSendPasswordRecoveryDto(lowercaseEmail, "EMAIL"))).resolves.toEqual({
        timeLeftMs: expect.any(Number)
      })
      await Promise.all([
        expect(redis.get(buildPasswordRecoveryTokenKey(accountId, "EMAIL"))).resolves.not.toBeNull(),
        expect(redis.get(buildPasswordRecoveryRequestKey(token))).resolves.not.toBeNull()
      ])
    })

    const createSendPasswordRecoveryDto = (identifier: string, to: "EMAIL" | "PHONE"): SendPasswordRecoveryDto => {
      return { identifier, to }
    }
    const email = "EMAIL@example.com"
    const lowercaseEmail = email.toLowerCase()
    const phone = "+375292817973"
    const createAccount = async (contact: "email" | "phone", accountId?: string) => {
      const profile = { create: { username: "", lowercaseUsername: "", name: "" } }
      const data = {
        ...(contact === "email" ? { email, lowercaseEmail, profile } : { phone, profile }),
        ...(accountId ? { id: accountId } : {})
      }
      await prisma.account.create({ data })
    }
    const createTelegramLink = async () => prisma.telegramLink.create({ data: { phone, telegramUserId: 1 } })
    const token = "aaaaaaaaaaaaaaaa"
    const accountId = "account123"
  })

  describe("checkPasswordRecoveryToken", () => {
    it("throws PASSWORD_RECOVERY_REQUEST_NOT_FOUND for a non-existent token", async () => {
      await expect(authService.checkPasswordRecoveryToken(checkPasswordRecoveryTokenDto)).rejects.toThrow(
        expect.objectContaining({ errorCode: ErrorCode.PASSWORD_RECOVERY_REQUEST_NOT_FOUND })
      )
    })

    it("returns accountId, request and timeLeftMs", async () => {
      await prisma.account.create({
        data: {
          email, lowercaseEmail,
          profile: { create: { username: "", lowercaseUsername: "", name: "" } }
        }
      })
      vi.spyOn(utils, "generateSecureToken").mockReturnValue(token)
      await authService.sendPasswordRecovery({ identifier: lowercaseEmail, to: "EMAIL" })
      await expect(authService.checkPasswordRecoveryToken(checkPasswordRecoveryTokenDto)).resolves.toEqual({
        accountId: expect.any(String),
        request: expect.any(Object),
        timeLeftMs: expect.any(Number)
      })
    })

    const token = "token"
    const checkPasswordRecoveryTokenDto: CheckPasswordRecoveryTokenDto = { token }
    const email = "EMAIL@example.com"
    const lowercaseEmail = email.toLowerCase()
  })

  describe("resetPassword", () => {
    it("throws PASSWORD_RECOVERY_REQUEST_NOT_FOUND for a non-existent token", async () => {
      await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.PASSWORD_RECOVERY_REQUEST_NOT_FOUND
      }))
    })

    it("updates password and passwordChangedAt in the DB and deletes password recovery data from Redis on success", async () => {
      vi.spyOn(utils, "generateSecureToken").mockReturnValue(token)
      const hashedOldPassword = await hashPassword(oldPassword)
      await prisma.account.create({
        data: {
          id: accountId, email, lowercaseEmail, password: hashedOldPassword,
          profile: { create: { username: "", lowercaseUsername: "", name: "" } }
        }
      })
      await authService.sendPasswordRecovery({ identifier: lowercaseEmail, to: "EMAIL" })
      const beforeReset = Date.now()
      await authService.resetPassword(resetPasswordDto)
      const [account] = await Promise.all([
        prisma.account.findUnique({ where: { id: accountId } }),
        expect(redis.get(buildPasswordRecoveryTokenKey(accountId, "EMAIL"))).resolves.toBeNull(),
        expect(redis.get(buildPasswordRecoveryRequestKey(token))).resolves.toBeNull()
      ])
      expect(account!.password).not.toBe(hashedOldPassword)
      expect(account!.passwordChangedAt!.getTime()).toBeGreaterThan(beforeReset)
    })

    const token = "aaaaaaaaaaaaaaaa"
    const oldPassword = "123456"
    const newPassword = "654321"
    const resetPasswordDto: ResetPasswordDto = { password: newPassword, token }
    const email = "EMAIL@example.com"
    const lowercaseEmail = email.toLowerCase()
    const accountId = "account123"
  })

  describe("me", () => {
    it("throws UNAUTHORIZED for a non-existent ID", async () => {
      await expect(authService.me(accountId)).rejects.toThrow(expect.objectContaining({
        errorCode: ErrorCode.UNAUTHORIZED
      }))
    })

    it("returns the account on success", async () => {
      await prisma.account.create({ data: { id: accountId } })
      await expect(authService.me(accountId)).resolves.not.toBeNull()
    })

    const accountId = "account123"
  })
})

describe("generateUniqueUsername", () => {
  beforeEach(async () => await cleanDb())

  it("retries when the generated username is already taken in the DB", async () => {
    await createAccount()
    const generateUsernameSpy = vi.spyOn(usernameGenerator, "generateUsername").mockReturnValueOnce(username)
    await generateUniqueUsername()
    expect(generateUsernameSpy).toHaveBeenCalledTimes(2)
  })

  it("skips the DB check when the generator repeats an already-known-taken username", async () => {
    await createAccount()
    const generateUsernameSpy = vi.spyOn(usernameGenerator, "generateUsername")
      .mockReturnValueOnce(username)
      .mockReturnValueOnce(username)
    const findUniqueSpy = vi.spyOn(prisma.profile, "findUnique")
    await generateUniqueUsername()
    expect(generateUsernameSpy).toHaveBeenCalledTimes(3)
    expect(findUniqueSpy).toHaveBeenCalledTimes(2)
  })

  it("truncates a username with more than 30 characters", async () => {
    vi.spyOn(usernameGenerator, "generateUsername").mockReturnValueOnce("username_with_more_than_30_characters")
    await expect(generateUniqueUsername()).resolves.toHaveLength(30)
  })

  it("preserves the 3-digit suffix when truncating", async () => {
    vi.spyOn(usernameGenerator, "generateUsername").mockReturnValueOnce("username_that_ends_with_3-digit_suffix_123")
    await expect(generateUniqueUsername()).resolves.match(/^.{27}\d{3}$/)
  })

  it("doesn't truncate a username with 30 or fewer characters", async () => {
    vi.spyOn(usernameGenerator, "generateUsername").mockReturnValue(username)
    await expect(generateUniqueUsername()).resolves.toBe(username)
  })

  it("throws USERNAME_GENERATION_ERROR after 20 unsuccessful attempts", async () => {
    for (let i = 0; i < 20; i++) {
      const currentUsername = `${username}${i}`
      await createAccount(currentUsername)
      vi.spyOn(usernameGenerator, "generateUsername").mockReturnValueOnce(currentUsername)
    }
    const generateUsernameSpy = vi.spyOn(usernameGenerator, "generateUsername")
    await expect(generateUniqueUsername()).rejects.toThrow(expect.objectContaining({
      errorCode: ErrorCode.USERNAME_GENERATION_ERROR
    }))
    expect(generateUsernameSpy).toHaveBeenCalledTimes(20)
  })

  it("returns a username derived from the email when it's provided", async () => {
    await expect(generateUniqueUsername("EMAIL@example.com")).resolves.toMatch(/email/)
  })

  it("returns a generated username when no email is provided", async () => {
    await expect(generateUniqueUsername()).resolves.toEqual(expect.any(String))
  })

  const username = "USERNAME"
  const createAccount = async (externalUsername: string = username) => {
    await prisma.account.create({
      data: {
        profile: { create: { username: externalUsername, lowercaseUsername: externalUsername.toLowerCase(), name: "" } }
      }
    })
  }
})