import { AppError } from "@/shared/app.error.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import { prisma } from "@/shared/prisma.client.js"
import { redis } from "@/shared/redis.client.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { appConfig } from "@/shared/app.config.js"
import { generateFromEmail, generateUsername } from "unique-username-generator"
import {
  emailVerificationService,
  buildTokensKey as buildEmailVerificationTokensKey, buildRequestKey as buildEmailVerificationRequestKey,
} from "@/modules/verification/email/email-verification.service.js"
import {
  phoneVerificationService,
  buildAccountIdsKey as buildPhoneVerificationAccountIdsKey, buildRequestKey as buildPhoneVerificationRequestKey
} from "@/modules/verification/phone/phone-verification.service.js"
import { GrammyError } from "grammy"
import { sendEmail } from "@/shared/mailer/mailer.service.js"
import { sendTelegramMessage } from "@/shared/bot/bot.service.js"
import { generateSecureCode, generateSecureToken } from "@/shared/utils/index.js"
import { googleClient } from "./google.client.js"
import type {
  LoginDto, RegisterDto, LoginWithPhoneDto, SendLoginWithPhoneDto, CheckAvailabilityDto, ResetPasswordDto,
  GoogleAuthDto, PasswordRecoveryContactsDto, SendPasswordRecoveryDto, CheckPasswordRecoveryTokenDto
} from "./auth.schemas.js"
import type { PasswordRecoveryTarget, ContactsDto, PasswordRecoveryTokenPayload } from "./auth.types.js"
import type { AccessTokenPayload, RefreshTokenPayload } from "@/shared/types/index.js"

export const authService = {
  refresh: async (refreshToken: string) => {
    try {
      const payload = jwt.verify(refreshToken, appConfig.jwtRefreshSecret) as RefreshTokenPayload
      const account = await prisma.account.findUnique({
        where: {
          id: payload.id
        }
      })
      if (!account) throw new AppError(ErrorCode.ACCOUNT_NOT_FOUND)
      const actualPasswordChangedAt = account.passwordChangedAt?.getTime() ?? 0
      if (payload.passwordChangedAt !== actualPasswordChangedAt) throw new AppError(ErrorCode.REFRESH_TOKEN_INVALID)
      const accessToken = generateAccessToken({
        id: account.id
      })
      const newRefreshToken = generateRefreshToken({
        id: account.id,
        rememberMe: payload.rememberMe,
        passwordChangedAt: account.passwordChangedAt?.getTime() ?? 0
      })
      return { accessToken, newRefreshToken, rememberMe: payload.rememberMe }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw new AppError(ErrorCode.REFRESH_TOKEN_EXPIRED)
      if (error instanceof jwt.JsonWebTokenError) throw new AppError(ErrorCode.REFRESH_TOKEN_INVALID)
      throw error
    }
  },

  login: async (dto: LoginDto) => {
    const account = await prisma.account.findFirst({
      where: {
        OR: [
          { login: dto.identifier },
          { lowercaseEmail: dto.identifier },
          { phone: dto.identifier }
        ]
      }
    })
    if (!account) throw new AppError(ErrorCode.ACCOUNT_NOT_FOUND)
    if (!account.password) throw new AppError(ErrorCode.PASSWORD_NOT_SET)
    const isPasswordValid = await bcrypt.compare(dto.password, account.password)
    if (!isPasswordValid) throw new AppError(ErrorCode.PASSWORD_INVALID)
    const accessToken = generateAccessToken({
      id: account.id
    })
    const refreshToken = generateRefreshToken({
      id: account.id,
      rememberMe: dto.rememberMe,
      passwordChangedAt: account.passwordChangedAt?.getTime() ?? 0
    })
    return { accessToken, refreshToken, rememberMe: dto.rememberMe }
  },

  sendLoginWithPhone: async (dto: SendLoginWithPhoneDto) => {
    try {
      const key = buildLoginWithPhoneKey(dto.phone)
      const [account, telegramLink, code, codeTtlLeftMs] = await Promise.all([
        prisma.account.findUnique({
          where: {
            phone: dto.phone
          },
          include: {
            profile: true
          }
        }),
        prisma.telegramLink.findUnique({
          where: {
            phone: dto.phone
          }
        }),
        redis.get(key),
        redis.pttl(key)
      ])
      if (!account) throw new AppError(ErrorCode.ACCOUNT_NOT_FOUND)
      if (!telegramLink) throw new AppError(ErrorCode.TELEGRAM_LINK_NOT_FOUND)
      if (code) {
        const maxTtlForResendMs = appConfig.auth.loginWithPhoneCodeTtlMs - appConfig.auth.loginWithPhoneCooldownMs
        if (codeTtlLeftMs > maxTtlForResendMs) throw new AppError(ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN, {
          timeLeftMs: codeTtlLeftMs - maxTtlForResendMs
        })
      }
      const newCode = generateSecureCode()
      await sendLoginWithPhoneCode({
        telegramUserId: telegramLink.telegramUserId,
        name: account.profile!.name,
        code: newCode
      })
      await redis.set(key, newCode, "PX", appConfig.auth.loginWithPhoneCodeTtlMs)
      return { timeLeftMs: appConfig.auth.loginWithPhoneCooldownMs }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(ErrorCode.TELEGRAM_BOT_BLOCKED)
      throw error
    }
  },

  loginWithPhone: async (dto: LoginWithPhoneDto) => {
    const key = buildLoginWithPhoneKey(dto.phone)
    const [account, code] = await Promise.all([
      prisma.account.findUnique({
        where: {
          phone: dto.phone
        },
        include: {
          profile: {
            select: {
              username: true
            }
          }
        }
      }),
      redis.get(key)
    ])
    if (!account) throw new AppError(ErrorCode.ACCOUNT_NOT_FOUND)
    if (!code) throw new AppError(ErrorCode.LOGIN_WITH_PHONE_REQUEST_NOT_FOUND)
    if (dto.code !== code) throw new AppError(ErrorCode.LOGIN_WITH_PHONE_CODE_INVALID)
    await redis.unlink(key)
    const accessToken = generateAccessToken({ id: account.id })
    const refreshToken = generateRefreshToken({
      id: account.id,
      rememberMe: dto.rememberMe,
      passwordChangedAt: account.passwordChangedAt?.getTime() ?? 0
    })
    return { accessToken, refreshToken, rememberMe: dto.rememberMe }
  },

  checkAvailability: async (dto: CheckAvailabilityDto) => {
    const value = dto.value
    let exists
    let errorCode
    switch (dto.field) {
      case "username":
        exists = await prisma.profile.findUnique({
          where: {
            lowercaseUsername: value
          }
        })
        errorCode = ErrorCode.USERNAME_TAKEN
        break
      case "email":
        exists = await prisma.account.findUnique({
          where: {
            lowercaseEmail: value
          }
        })
        errorCode = ErrorCode.EMAIL_TAKEN
        break
      case "phone":
        exists = await prisma.account.findUnique({
          where: {
            phone: value
          }
        })
        errorCode = ErrorCode.PHONE_TAKEN
        break
      case "login":
        exists = await prisma.account.findUnique({
          where: {
            login: value
          }
        })
        errorCode = ErrorCode.LOGIN_TAKEN
        break
    }
    if (exists) throw new AppError(errorCode!)
  },

  register: async (dto: RegisterDto) => {
    const lowercaseEmail = dto.email ? dto.email.toLowerCase() : null
    const orConditions: Array<Record<string, string | Record<string, string>>> = []
    if (dto.username) orConditions.push({ profile: { lowercaseUsername: dto.username.toLowerCase() } })
    if (dto.phone) orConditions.push({ phone: dto.phone })
    if (lowercaseEmail) orConditions.push({ lowercaseEmail })
    if (dto.login) orConditions.push({ login: dto.login })
    const candidate = await prisma.account.findFirst({
      where: {
        OR: orConditions
      },
      include: {
        profile: true
      }
    })
    if (candidate) {
      if (dto.username && candidate.profile!.lowercaseUsername === dto.username.toLowerCase()) throw new AppError(ErrorCode.USERNAME_TAKEN)
      if (dto.email && candidate.lowercaseEmail === lowercaseEmail) throw new AppError(ErrorCode.EMAIL_TAKEN)
      if (dto.phone && candidate.phone === dto.phone) throw new AppError(ErrorCode.PHONE_TAKEN)
      if (dto.login && candidate.login === dto.login) throw new AppError(ErrorCode.LOGIN_TAKEN)
    }
    if (lowercaseEmail) await emailVerificationService.checkRegistration({ email: lowercaseEmail })
    if (dto.phone) await phoneVerificationService.checkRegistration({ phone: dto.phone })
    const username = dto.username ?? await generateUniqueUsername(dto.email)
    const hashedPassword = await hashPassword(dto.password)
    await prisma.account.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        lowercaseEmail,
        login: dto.login,
        password: hashedPassword,
        profile: {
          create: {
            username,
            lowercaseUsername: username.toLowerCase(),
            name: dto.name
          }
        }
      }
    })
    const multi = redis.multi()
    if (lowercaseEmail) {
      const tokensKey = buildEmailVerificationTokensKey(lowercaseEmail)
      const tokens = await redis.smembers(tokensKey)
      if (tokens.length > 0) multi.unlink(tokensKey, ...tokens.map(token => buildEmailVerificationRequestKey(token)))
    }
    if (dto.phone) {
      const accountIdsKey = buildPhoneVerificationAccountIdsKey(dto.phone)
      const accountIds = await redis.smembers(accountIdsKey)
      if (accountIds.length > 0) multi.unlink(
        accountIdsKey,
        ...accountIds.map(accountId => buildPhoneVerificationRequestKey(dto.phone!, accountId))
      )
    }
    await multi.exec()
  },

  google: async (dto: GoogleAuthDto) => {
    const googleResponse = await googleClient.getToken(dto.code)
    const idToken = googleResponse.tokens.id_token
    if (!idToken) throw new AppError(ErrorCode.GOOGLE_AUTH_FAILED)
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: appConfig.googleClientId
    })
    const payload = ticket.getPayload()
    if (!payload) throw new AppError(ErrorCode.GOOGLE_AUTH_FAILED)
    const email = payload.email
    if (!email) throw new AppError(ErrorCode.GOOGLE_AUTH_FAILED)
    const googleId = payload.sub
    const lowercaseEmail = email.toLowerCase()
    const name = payload.name?.slice(0, 30) ?? "Некто"
    const avatarUrl = payload.picture ?? null
    let account = await prisma.account.findFirst({
      where: {
        OR: [
          { googleId },
          { lowercaseEmail }
        ]
      }
    })
    let isNewAccount = false
    if (!account) {
      isNewAccount = true
      const username = await generateUniqueUsername(email)
      const lowercaseUsername = username.toLowerCase()
      account = await prisma.account.create({
        data: {
          googleId,
          email,
          lowercaseEmail,
          profile: {
            create: {
              username,
              lowercaseUsername,
              name,
              avatarUrl
            }
          }
        }
      })
      const tokensKey = buildEmailVerificationTokensKey(lowercaseEmail)
      const tokens = await redis.smembers(tokensKey)
      if (tokens.length > 0) {
        await redis.unlink(tokensKey, ...tokens.map(token => buildEmailVerificationRequestKey(token)))
      }
    } else if (!account.googleId) {
      await prisma.account.update({
        where: {
          id: account.id
        },
        data: {
          googleId
        }
      })
    }
    const accessToken = generateAccessToken({
      id: account.id
    })
    const refreshToken = generateRefreshToken({
      id: account.id,
      rememberMe: true,
      passwordChangedAt: account.passwordChangedAt?.getTime() ?? 0
    })
    return { accessToken, refreshToken, isNewAccount }
  },

  getPasswordRecoveryContacts: async (dto: PasswordRecoveryContactsDto) => {
    const account = await prisma.account.findFirst({
      where: {
        OR: [
          { login: dto.identifier },
          { lowercaseEmail: dto.identifier },
          { phone: dto.identifier }
        ]
      }
    })
    if (!account) throw new AppError(ErrorCode.ACCOUNT_NOT_FOUND)
    let contacts: ContactsDto = {}
    if (account.email) {
      const email = account.email
      const atPosition = email.indexOf("@")
      const local = email.slice(0, atPosition)
      const domain = email.slice(atPosition)
      let blurredLocal = local.length > 5
        ? local.slice(0, 2) + "***" + local.slice(-2)
        : local[0] + "***"
      const blurredEmail = blurredLocal + domain
      contacts.email = blurredEmail
    }
    if (account.phone) {
      const phone = account.phone
      const blurredPhone = "+" + "*".repeat(phone.length - 3) + phone.slice(-2)
      contacts.phone = blurredPhone
    }
    return contacts
  },

  sendPasswordRecovery: async (dto: SendPasswordRecoveryDto) => {
    try {
      const to = dto.to
      const account = await prisma.account.findFirst({
        where: {
          OR: [
            { login: dto.identifier },
            { lowercaseEmail: dto.identifier },
            { phone: dto.identifier }
          ]
        },
        include: {
          profile: true
        }
      })
      if (!account) throw new AppError(ErrorCode.ACCOUNT_NOT_FOUND)
      const toEmail = to === "EMAIL"
      if (toEmail && !account.email) throw new AppError(ErrorCode.EMAIL_NOT_LINKED)
      let telegramUserId: number | undefined
      if (!toEmail) {
        if (!account.phone) throw new AppError(ErrorCode.PHONE_NOT_LINKED)
        const telegramLink = await prisma.telegramLink.findUnique({
          where: {
            phone: account.phone
          }
        })
        if (!telegramLink) throw new AppError(ErrorCode.TELEGRAM_LINK_NOT_FOUND)
        telegramUserId = telegramLink.telegramUserId
      }
      const currentCooldownMs = toEmail
        ? appConfig.auth.passwordRecoveryEmailCooldownMs
        : appConfig.auth.passwordRecoveryTelegramMessageCooldownMs
      const tokenKey = buildPasswordRecoveryTokenKey(account.id, to)
      const [token, tokenTtlLeftMs] = await Promise.all([
        redis.get(tokenKey),
        redis.pttl(tokenKey)
      ])
      if (token) {
        const maxTtlForResendMs = appConfig.auth.passwordRecoveryTokenTtlMs - currentCooldownMs
        if (tokenTtlLeftMs > maxTtlForResendMs) throw new AppError(
          toEmail ? ErrorCode.SEND_EMAIL_COOLDOWN : ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN,
          { timeLeftMs: tokenTtlLeftMs - maxTtlForResendMs }
        )
        await redis.unlink(buildPasswordRecoveryRequestKey(token))
      }
      const newToken = generateSecureToken()
      const target: PasswordRecoveryTarget = toEmail
        ? { to: "EMAIL", email: account.email! }
        : { to: "PHONE", telegramUserId: telegramUserId! }
      await sendPasswordRecoveryUrl({
        target,
        name: account.profile!.name,
        token: newToken
      })
      const tokenPayload: PasswordRecoveryTokenPayload = {
        accountId: account.id
      }
      await Promise.all([
        redis.set(tokenKey, newToken, "PX", appConfig.auth.passwordRecoveryTokenTtlMs),
        redis.set(
          buildPasswordRecoveryRequestKey(newToken), JSON.stringify(tokenPayload),
          "PX", appConfig.auth.passwordRecoveryTokenTtlMs
        )
      ])
      return { timeLeftMs: currentCooldownMs }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(ErrorCode.TELEGRAM_BOT_BLOCKED)
      throw error
    }
  },

  checkPasswordRecoveryToken: async (dto: CheckPasswordRecoveryTokenDto) => {
    const requestKey = buildPasswordRecoveryRequestKey(dto.token)
    const [request, requestTtlLeftms] = await Promise.all([
      redis.get(requestKey),
      redis.pttl(requestKey)
    ])
    if (!request) throw new AppError(ErrorCode.PASSWORD_RECOVERY_REQUEST_NOT_FOUND)
    const parsedRequest: PasswordRecoveryTokenPayload = JSON.parse(request)
    return { accountId: parsedRequest.accountId, request: parsedRequest, timeLeftMs: requestTtlLeftms }
  },

  resetPassword: async (dto: ResetPasswordDto) => {
    const { request } = await authService.checkPasswordRecoveryToken({ token: dto.token })
    const hashedPassword = await hashPassword(dto.password)

    const keysToUnlink = new Set<string>()
    const emailTokenKey = buildPasswordRecoveryTokenKey(request.accountId, "EMAIL")
    const phoneTokenKey = buildPasswordRecoveryTokenKey(request.accountId, "PHONE")
    const [emailToken, phoneToken] = await Promise.all([
      redis.get(emailTokenKey),
      redis.get(phoneTokenKey)
    ])
    if (emailToken) {
      keysToUnlink.add(emailTokenKey)
      keysToUnlink.add(buildPasswordRecoveryRequestKey(emailToken))
    }
    if (phoneToken) {
      keysToUnlink.add(phoneTokenKey)
      keysToUnlink.add(buildPasswordRecoveryRequestKey(phoneToken))
    }

    await prisma.account.update({
      where: {
        id: request.accountId
      },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date()
      }
    })
    if (keysToUnlink.size > 0) await redis.unlink(...keysToUnlink)
  },

  me: async (accountId: string) => {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        profile: {
          select: {
            username: true
          }
        }
      }
    })
    if (!account) throw new AppError(ErrorCode.UNAUTHORIZED)
    return account
  }
}

const hashPassword = async (password: string) => await bcrypt.hash(password, 10)

const generateAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign({ id: payload.id }, appConfig.jwtAccessSecret, { expiresIn: "5m" })
}

const generateRefreshToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(
    { id: payload.id, rememberMe: payload.rememberMe, passwordChangedAt: payload.passwordChangedAt },
    appConfig.jwtRefreshSecret,
    { expiresIn: "1y" }
  )
}

const sendLoginWithPhoneCode = async (params: {
  telegramUserId: number,
  name: string,
  code: string
}) => {
  const messageRows = [
    `Здравствуйте, ${params.name}\n`,
    `Ваш код для входа: ${params.code}\n`,
    "<i>Этот код будет считаться актуальным <b>1 час</b> (если не запрашивать новый)</i>"
  ]
  await sendTelegramMessage(params.telegramUserId, messageRows.join("\n"))
}

const generatePasswordRecoveryUrl = (token: string) => `${appConfig.clientUrl}/reset-password/${token}`

const sendPasswordRecoveryUrl = async (params: {
  target: PasswordRecoveryTarget,
  name: string,
  token: string
}) => {
  const url = generatePasswordRecoveryUrl(params.token)
  if (params.target.to === "EMAIL") {
    await sendEmail({
      email: params.target.email,
      templateId: "reset-password",
      variables: {
        name: params.name,
        url
      }
    })
  } else {
    const messageRows = [
      `Здравствуйте, ${params.name}\n`,
      "Был запрошен сброс пароля для привязанного к этому номеру телефона аккаунта в ROVELY",
      "Для завершения перейдите по ссылке ниже и укажите новый пароль:\n",
      `${url}\n`,
      "<i>Ссылка будет считаться актуальной <b>1 час</b> (если не запрашивать новую)\n",
      "Если вы не запрашивали сброс пароля — просто проигнорируйте это сообщение</i>"
    ]
    await sendTelegramMessage(params.target.telegramUserId, messageRows.join("\n"))
  }
}

const generateUniqueUsername = async (email?: string | null) => {
  let triedUsernames = new Set<string>()
  while (true) {
    let username = email
      ? generateFromEmail(email.toLowerCase(), 3)
      : generateUsername("", 3, 30)
    if (username.length > 30) username = username.slice(0, 27) + username.slice(-3)
    const lowercaseUsername = username.toLowerCase()
    if (triedUsernames.has(lowercaseUsername)) continue
    const account = await prisma.profile.findUnique({
      where: {
        lowercaseUsername
      }
    })
    if (!account) return username
    triedUsernames.add(lowercaseUsername)
    if (triedUsernames.size > 20) throw new AppError(ErrorCode.USERNAME_GENERATION_ERROR)
  }
}

const buildLoginWithPhoneKey = (phone: string) => `login-with-phone:${phone}`
const buildPasswordRecoveryTokenKey = (accountId: string, to: "EMAIL" | "PHONE") => {
  return `password-recovery-token:account-id:${accountId}:to:${to}`
}
const buildPasswordRecoveryRequestKey = (token: string) => `password-recovery-request:${token}`