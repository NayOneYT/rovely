import { AppError, ErrorCode } from "@/types/index.js"
import { prisma } from "@/prisma/client.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "@/config/index.js"
import { generateFromEmail, generateUsername } from "unique-username-generator"
import { emailVerificationService } from "@/modules/verification/email/service.js"
import { phoneVerificationService } from "@/modules/verification/phone/service.js"
import { GrammyError } from "grammy"
import { bot } from "@/lib/telegramBot.js"
import {
  generateCode, generateSecureToken,
  PHONE_CODE_RATE_LIMIT_MS, PHONE_CODE_EXPIRY_MS, PASSWORD_RECOVERY_EMAIL_RATE_LIMIT_MS, PASSWORD_RECOVERY_MESSAGE_RATE_LIMIT_MS, RESET_PASSWORD_TOKEN_EXPIRY_MS
} from "@/utils/index.js"
import { googleClient } from "@/lib/google.js"
import { resend } from "@/lib/email.js"
import type { LoginDto, RegisterDto, LoginWithPhoneDto, SendLoginWithPhoneCodeDto, CheckAvailabilityDto, ResetPasswordDto, GoogleAuthDto, PasswordRecoveryContactsDto, SendPasswordRecoveryDto, CheckPasswordRecoveryTokenDto } from "./schema.js"
import type { ContactsDto } from "./types.js"

const hashPassword = async (password: string) => await bcrypt.hash(password, 10)

const sendCode = async (name: string, telegramUserId: number, code: string) => {
  await bot.api.sendMessage(
    telegramUserId,
    `Здравствуйте, ${name}\n\nВаш код для входа: ${code}\n\n<i>Этот код будет считаться актуальным <b>1 час</b> (если не запрашивать новый)</i>`,
    { parse_mode: "HTML" })
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
    if (triedUsernames.size > 20) throw new AppError(500, ErrorCode.USERNAME_GENERATION_ERROR)
  }
}

const generateResetPasswordUrl = (token: string) => {
  const baseUrl = config.nodeEnv === "development"
    ? "http://localhost:5173"
    : "https://rovely.org"
  return `${baseUrl}/reset-password/${token}`
}

const sendPasswordRecoveryEmail = async (to: string, name: string, token: string) => {
  await resend.emails.send({
    to,
    template: {
      id: "reset-password",
      variables: {
        name,
        url: generateResetPasswordUrl(token)
      }
    }
  })
}

const sendPasswordRecoveryMessage = async (telegramUserId: number, name: string, token: string) => {
  await bot.api.sendMessage(
    telegramUserId,
    `Здравствуйте, ${name}\n\nБыл запрошен сброс пароля для привязанного к этому номеру телефона аккаунта в ROVELY.\nДля завершения перейдите по ссылке ниже и укажите новый пароль:\n\n${generateResetPasswordUrl(token)}\n\n<i>Эта ссылка будет считаться актуальной <b>1 час</b> (если не запрашивать новую)\n\nЕсли вы не запрашивали сброс пароля — просто проигнорируйте это сообщение</i>`,
    { parse_mode: "HTML" }
  )
}

export const authService = {
  refresh: async (refreshToken: string) => {
    try {
      const payload = jwt.verify(refreshToken, config.jwtRefreshSecret) as { id: string, rememberMe: boolean, passwordChangedAt: number }
      const account = await prisma.account.findUnique({
        where: {
          id: payload.id
        }
      })
      if (!account) throw new AppError(404, ErrorCode.ACCOUNT_NOT_FOUND)
      const actualPasswordChangedAt = account.passwordChangedAt?.getTime() ?? 0
      if (payload.passwordChangedAt !== actualPasswordChangedAt) throw new AppError(401, ErrorCode.TOKEN_INVALID)
      const accessToken = jwt.sign({ id: payload.id, role: account.role }, config.jwtAccessSecret, { expiresIn: "5m" })
      const newRefreshToken = jwt.sign({ id: payload.id, rememberMe: payload.rememberMe, passwordChangedAt: payload.passwordChangedAt }, config.jwtRefreshSecret, { expiresIn: "1y" })
      return { accessToken, newRefreshToken, rememberMe: payload.rememberMe }
    } catch (error) {
      if (error instanceof AppError) throw error
      if (error instanceof jwt.TokenExpiredError) throw new AppError(401, ErrorCode.TOKEN_EXPIRED)
      throw new AppError(401, ErrorCode.TOKEN_INVALID)
    }
  },

  login: async (data: LoginDto) => {
    const account = await prisma.account.findFirst({
      where: {
        OR: [
          { login: data.identifier },
          { lowercaseEmail: data.identifier },
          { phone: data.identifier }
        ]
      }
    })
    if (!account) throw new AppError(404, ErrorCode.ACCOUNT_NOT_FOUND)
    if (!account.password) throw new AppError(422, ErrorCode.PASSWORD_NOT_SET)
    const isPasswordValid = await bcrypt.compare(data.password, account.password)
    if (!isPasswordValid) throw new AppError(401, ErrorCode.PASSWORD_INVALID)
    const accessToken = jwt.sign({ id: account.id, role: account.role }, config.jwtAccessSecret, { expiresIn: "5m" })
    const refreshToken = jwt.sign({ id: account.id, rememberMe: data.rememberMe, passwordChangedAt: account.passwordChangedAt?.getTime() ?? 0 }, config.jwtRefreshSecret, { expiresIn: "1y" })
    return { accessToken, refreshToken, rememberMe: data.rememberMe }
  },

  loginWithPhone: async (data: LoginWithPhoneDto) => {
    const account = await prisma.account.findUnique({
      where: {
        phone: data.phone
      }
    })
    if (!account) throw new AppError(404, ErrorCode.ACCOUNT_NOT_FOUND)
    const request = await prisma.loginWithPhoneRequest.findUnique({
      where: {
        phone: data.phone
      }
    })
    if (!request) throw new AppError(404, ErrorCode.LOGIN_WITH_PHONE_REQUEST_NOT_FOUND)
    const now = Date.now()
    if (request.updatedAt.getTime() < now - PHONE_CODE_EXPIRY_MS) throw new AppError(410, ErrorCode.CODE_EXPIRED)
    if (data.code !== request.code) throw new AppError(422, ErrorCode.CODE_INVALID)
    await prisma.loginWithPhoneRequest.delete({
      where: {
        phone: data.phone
      }
    })
    const accessToken = jwt.sign({ id: account.id, role: account.role }, config.jwtAccessSecret, { expiresIn: "5m" })
    const refreshToken = jwt.sign({ id: account.id, rememberMe: data.rememberMe, passwordChangedAt: account.passwordChangedAt?.getTime() ?? 0 }, config.jwtRefreshSecret, { expiresIn: "1y" })
    return { accessToken, refreshToken, rememberMe: data.rememberMe }
  },

  sendLoginWithPhoneCode: async (data: SendLoginWithPhoneCodeDto) => {
    try {
      const phone = data.phone
      const account = await prisma.account.findUnique({
        where: {
          phone
        },
        include: {
          profile: true
        }
      })
      if (!account) throw new AppError(404, ErrorCode.ACCOUNT_NOT_FOUND)
      const [request, link] = await Promise.all([
        prisma.loginWithPhoneRequest.findUnique({
          where: {
            phone
          }
        }),
        prisma.telegramLink.findUnique({
          where: {
            phone
          }
        })
      ])
      if (!link) throw new AppError(404, ErrorCode.TELEGRAM_LINK_NOT_FOUND)
      const now = Date.now()
      if (request && request.updatedAt.getTime() > now - PHONE_CODE_RATE_LIMIT_MS) {
        const timePassedMs = now - request.updatedAt.getTime()
        const timeLeftMs = PHONE_CODE_RATE_LIMIT_MS - timePassedMs
        throw new AppError(429, ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN, { timeLeftMs })
      }
      const code = generateCode()
      await Promise.all([
        request
          ? prisma.loginWithPhoneRequest.update({
            where: {
              phone
            },
            data: {
              code
            }
          })
          : prisma.loginWithPhoneRequest.create({
            data: {
              code,
              phone
            }
          }),
        sendCode(account.profile!.name, link.telegramUserId, code)
      ])
      return { timeLeftMs: PHONE_CODE_RATE_LIMIT_MS }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(403, ErrorCode.TELEGRAM_BOT_BLOCKED)
      throw error
    }
  },

  checkAvailability: async (data: CheckAvailabilityDto) => {
    const value = data.value
    let exists
    let errorCode
    switch (data.field) {
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
    if (exists) throw new AppError(409, errorCode!)
  },

  register: async (data: RegisterDto) => {
    const lowercaseEmail = data.email ? data.email.toLowerCase() : null
    const orConditions: Array<Record<string, string | Record<string, string>>> = []
    if (data.username) orConditions.push({ profile: { lowercaseUsername: data.username.toLowerCase() } })
    if (data.phone) orConditions.push({ phone: data.phone })
    if (lowercaseEmail) orConditions.push({ lowercaseEmail })
    if (data.login) orConditions.push({ login: data.login })
    const candidate = await prisma.account.findFirst({
      where: {
        OR: orConditions
      },
      include: {
        profile: true
      }
    })
    if (candidate) {
      if (data.username && candidate.profile!.lowercaseUsername === data.username.toLowerCase()) throw new AppError(409, ErrorCode.USERNAME_TAKEN)
      if (data.email && candidate.lowercaseEmail === lowercaseEmail) throw new AppError(409, ErrorCode.EMAIL_TAKEN)
      if (data.phone && candidate.phone === data.phone) throw new AppError(409, ErrorCode.PHONE_TAKEN)
      if (data.login && candidate.login === data.login) throw new AppError(409, ErrorCode.LOGIN_TAKEN)
    }
    if (lowercaseEmail) await emailVerificationService.checkRegistration({ email: lowercaseEmail })
    if (data.phone) await phoneVerificationService.checkRegistration({ phone: data.phone })
    const username = data.username ?? await generateUniqueUsername(data.email)
    const hashedPassword = await hashPassword(data.password)
    await prisma.account.create({
      data: {
        phone: data.phone,
        email: data.email,
        lowercaseEmail,
        login: data.login,
        password: hashedPassword,
        profile: {
          create: {
            username,
            lowercaseUsername: username.toLowerCase(),
            name: data.name
          }
        }
      }
    })
    if (lowercaseEmail) await prisma.emailVerificationRequest.deleteMany({
      where: {
        lowercaseEmail
      }
    })
    if (data.phone) await prisma.phoneVerificationRequest.deleteMany({
      where: {
        phone: data.phone
      }
    })
  },

  googleAuth: async (data: GoogleAuthDto) => {
    const googleResponse = await googleClient.getToken(data.code)
    const idToken = googleResponse.tokens.id_token
    if (!idToken) throw new AppError(422, ErrorCode.GOOGLE_AUTH_FAILED)
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId
    })
    const payload = ticket.getPayload()
    if (!payload) throw new AppError(422, ErrorCode.GOOGLE_AUTH_FAILED)
    const email = payload.email
    if (!email) throw new AppError(422, ErrorCode.GOOGLE_AUTH_FAILED)
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
    let isNewUser = false
    if (!account) {
      isNewUser = true
      const username = await generateUniqueUsername(email)
      const lowercaseUsername = username.toLowerCase(); // The ";" here is mandatory so that the engine doesn't merge this line with the next one
      [account] = await prisma.$transaction([
        prisma.account.create({
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
        }),
        prisma.emailVerificationRequest.deleteMany({
          where: {
            lowercaseEmail
          }
        })
      ])
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
    const accessToken = jwt.sign({ id: account.id, role: account.role }, config.jwtAccessSecret, { expiresIn: "5m" })
    const refreshToken = jwt.sign({ id: account.id, rememberMe: true, passwordChangedAt: account.passwordChangedAt?.getTime() ?? 0 }, config.jwtRefreshSecret, { expiresIn: "1y" })
    return { isNewUser, accessToken, refreshToken }
  },

  getPasswordRecoveryContacts: async (data: PasswordRecoveryContactsDto) => {
    const account = await prisma.account.findFirst({
      where: {
        OR: [
          { login: data.identifier },
          { lowercaseEmail: data.identifier },
          { phone: data.identifier }
        ]
      }
    })
    if (!account) throw new AppError(404, ErrorCode.ACCOUNT_NOT_FOUND)
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

  sendPasswordRecovery: async (data: SendPasswordRecoveryDto) => {
    try {
      const to = data.to
      const account = await prisma.account.findFirst({
        where: {
          OR: [
            { login: data.identifier },
            { lowercaseEmail: data.identifier },
            { phone: data.identifier }
          ]
        },
        include: {
          profile: true
        }
      })
      if (!account) throw new AppError(404, ErrorCode.ACCOUNT_NOT_FOUND)
      if (to === "EMAIL" && !account.email) throw new AppError(422, ErrorCode.EMAIL_NOT_LINKED)
      let telegramUserId: number
      if (to === "PHONE") {
        if (!account.phone) throw new AppError(422, ErrorCode.PHONE_NOT_LINKED)
        const link = await prisma.telegramLink.findUnique({
          where: {
            phone: account.phone
          }
        })
        if (!link) throw new AppError(404, ErrorCode.TELEGRAM_LINK_NOT_FOUND)
        telegramUserId = link.telegramUserId
      }
      const request = await prisma.passwordRecoveryRequest.findUnique({
        where: {
          accountId_to: {
            accountId: account.id,
            to
          }
        }
      })
      const now = Date.now()
      const rateLimitMs = to === "EMAIL"
        ? PASSWORD_RECOVERY_EMAIL_RATE_LIMIT_MS
        : PASSWORD_RECOVERY_MESSAGE_RATE_LIMIT_MS
      if (request && request.updatedAt.getTime() > now - rateLimitMs) {
        const errorCode = to === "EMAIL"
          ? ErrorCode.SEND_EMAIL_COOLDOWN
          : ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN
        const timePassedMs = now - request.updatedAt.getTime()
        const timeLeftMs = rateLimitMs - timePassedMs
        throw new AppError(429, errorCode, { timeLeftMs })
      }
      const token = generateSecureToken()
      to === "EMAIL"
        ? await sendPasswordRecoveryEmail(account.email!, account.profile!.name, token)
        : await sendPasswordRecoveryMessage(telegramUserId!, account.profile!.name, token)
      request
        ? await prisma.passwordRecoveryRequest.update({
          where: {
            accountId_to: {
              accountId: account.id,
              to
            }
          },
          data: {
            token
          }
        })
        : await prisma.passwordRecoveryRequest.create({
          data: {
            token,
            accountId: account.id,
            to
          }
        })
      return { to, timeLeftMs: rateLimitMs }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(403, ErrorCode.TELEGRAM_BOT_BLOCKED)
      throw error
    }
  },

  checkPasswordRecoveryToken: async (data: CheckPasswordRecoveryTokenDto) => {
    const request = await prisma.passwordRecoveryRequest.findUnique({
      where: {
        token: data.token
      }
    })
    if (!request) throw new AppError(404, ErrorCode.PASSWORD_RECOVERY_REQUEST_NOT_FOUND)
    const now = Date.now()
    if (request.updatedAt.getTime() < now - RESET_PASSWORD_TOKEN_EXPIRY_MS) throw new AppError(410, ErrorCode.PASSWORD_RECOVERY_TOKEN_EXPIRED)
    return request
  },

  resetPassword: async (data: ResetPasswordDto) => {
    const request = await authService.checkPasswordRecoveryToken({ token: data.token })
    const hashedPassword = await hashPassword(data.password)
    await prisma.$transaction([
      prisma.account.update({
        where: {
          id: request.accountId
        },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date()
        }
      }),
      prisma.passwordRecoveryRequest.deleteMany({
        where: {
          accountId: request.accountId
        }
      })
    ])
  },

  me: async (accountId: string) => {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        profile: {
          select: {
            username: true,
          }
        }
      }
    })
    if (!account) throw new AppError(401, ErrorCode.UNAUTHORIZED)
    return account
  }
}