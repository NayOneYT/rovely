import { AppError, ErrorCode } from "@/shared/types/index.js"
import { prisma } from "@/shared/prisma.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "@/shared/config.js"
import { generateFromEmail, generateUsername } from "unique-username-generator"
import { emailVerificationService } from "@/modules/verification/email/service.js"
import { phoneVerificationService } from "@/modules/verification/phone/service.js"
import { GrammyError } from "grammy"
import { sendEmail } from "@/shared/mailer/index.js"
import { sendTelegramMessage } from "@/shared/bot/index.js"
import { generateSecureCode, generateSecureToken } from "@/shared/utils/index.js"
import { googleClient } from "./google.client.js"
import type { LoginDto, RegisterDto, LoginWithPhoneDto, SendLoginWithPhoneDto, CheckAvailabilityDto, ResetPasswordDto, GoogleAuthDto, PasswordRecoveryContactsDto, SendPasswordRecoveryDto, CheckPasswordRecoveryTokenDto } from "./schema.js"
import type { PasswordRecoveryTarget, ContactsDto } from "./types.js"
import type { AccessTokenPayload, RefreshTokenPayload } from "@/shared/types/index.js"

export const authService = {
  refresh: async (refreshToken: string) => {
    try {
      const payload = jwt.verify(refreshToken, config.jwtRefreshSecret) as RefreshTokenPayload
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
      const phone = dto.phone
      const [account, request, link] = await Promise.all([
        prisma.account.findUnique({
          where: {
            phone
          },
          include: {
            profile: true
          }
        }),
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
      if (!account) throw new AppError(ErrorCode.ACCOUNT_NOT_FOUND)
      if (!link) throw new AppError(ErrorCode.TELEGRAM_LINK_NOT_FOUND)
      const now = Date.now()
      if (request && request.updatedAt.getTime() > now - config.auth.loginWithPhoneCooldownMs) {
        const timePassedMs = now - request.updatedAt.getTime()
        const timeLeftMs = config.auth.loginWithPhoneCooldownMs - timePassedMs
        throw new AppError(ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN, { timeLeftMs })
      }
      const code = generateSecureCode()
      await sendLoginWithPhoneCode(link.telegramUserId, account.profile!.name, code)
      await prisma.loginWithPhoneRequest.upsert({
        where: {
          phone
        },
        update: {
          code
        },
        create: {
          code,
          phone
        }
      })
      return { timeLeftMs: config.auth.loginWithPhoneCooldownMs }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(ErrorCode.TELEGRAM_BOT_BLOCKED)
      throw error
    }
  },

  loginWithPhone: async (dto: LoginWithPhoneDto) => {
    const [account, request] = await Promise.all([
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
      prisma.loginWithPhoneRequest.findUnique({
        where: {
          phone: dto.phone
        }
      })
    ])
    if (!account) throw new AppError(ErrorCode.ACCOUNT_NOT_FOUND)
    if (!request) throw new AppError(ErrorCode.LOGIN_WITH_PHONE_REQUEST_NOT_FOUND)
    const now = Date.now()
    if (request.updatedAt.getTime() < now - config.auth.loginWithPhoneCodeTtlMs) throw new AppError(ErrorCode.LOGIN_WITH_PHONE_CODE_EXPIRED)
    if (dto.code !== request.code) throw new AppError(ErrorCode.LOGIN_WITH_PHONE_CODE_INVALID)
    await prisma.loginWithPhoneRequest.delete({
      where: {
        phone: dto.phone
      }
    })
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
    if (lowercaseEmail) await prisma.emailVerificationRequest.deleteMany({
      where: {
        lowercaseEmail
      }
    })
    if (dto.phone) await prisma.phoneVerificationRequest.deleteMany({
      where: {
        phone: dto.phone
      }
    })
  },

  google: async (dto: GoogleAuthDto) => {
    const googleResponse = await googleClient.getToken(dto.code)
    const idToken = googleResponse.tokens.id_token
    if (!idToken) throw new AppError(ErrorCode.GOOGLE_AUTH_FAILED)
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId
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
      if (to === "EMAIL" && !account.email) throw new AppError(ErrorCode.EMAIL_NOT_LINKED)
      let telegramUserId: number = 0
      if (to === "PHONE") {
        if (!account.phone) throw new AppError(ErrorCode.PHONE_NOT_LINKED)
        const link = await prisma.telegramLink.findUnique({
          where: {
            phone: account.phone
          }
        })
        if (!link) throw new AppError(ErrorCode.TELEGRAM_LINK_NOT_FOUND)
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
      const cooldownMs = to === "EMAIL"
        ? config.auth.passwordRecoveryEmailCooldownMs
        : config.auth.passwordRecoveryTelegramMessageCooldownMs
      if (request && request.updatedAt.getTime() > now - cooldownMs) {
        const errorCode = to === "EMAIL"
          ? ErrorCode.SEND_EMAIL_COOLDOWN
          : ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN
        const timePassedMs = now - request.updatedAt.getTime()
        const timeLeftMs = cooldownMs - timePassedMs
        throw new AppError(errorCode, { timeLeftMs })
      }
      const token = generateSecureToken()
      const target: PasswordRecoveryTarget = to === "EMAIL"
        ? { to, email: account.email! }
        : { to, telegramUserId }
      await sendPasswordRecoveryUrl(target, account.profile!.name, token)
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
      return { to, timeLeftMs: cooldownMs }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(ErrorCode.TELEGRAM_BOT_BLOCKED)
      throw error
    }
  },

  checkPasswordRecoveryToken: async (dto: CheckPasswordRecoveryTokenDto) => {
    const request = await prisma.passwordRecoveryRequest.findUnique({
      where: {
        token: dto.token
      }
    })
    if (!request) throw new AppError(ErrorCode.PASSWORD_RECOVERY_REQUEST_NOT_FOUND)
    const now = Date.now()
    const timeLeftMs = request.updatedAt.getTime() + config.auth.passwordRecoveryTokenTtlMs - now
    if (timeLeftMs <= 0) throw new AppError(ErrorCode.PASSWORD_RECOVERY_TOKEN_EXPIRED)
    return { accountId: request.accountId, timeLeftMs }
  },

  resetPassword: async (dto: ResetPasswordDto) => {
    const { accountId } = await authService.checkPasswordRecoveryToken({ token: dto.token })
    const hashedPassword = await hashPassword(dto.password)
    await prisma.$transaction([
      prisma.account.update({
        where: {
          id: accountId
        },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date()
        }
      }),
      prisma.passwordRecoveryRequest.deleteMany({
        where: {
          accountId: accountId
        }
      })
    ])
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

const generateAccessToken = (payload: AccessTokenPayload) => jwt.sign({ id: payload.id }, config.jwtAccessSecret, { expiresIn: "5m" })
const generateRefreshToken = (payload: RefreshTokenPayload) => jwt.sign({ id: payload.id, rememberMe: payload.rememberMe, passwordChangedAt: payload.passwordChangedAt }, config.jwtRefreshSecret, { expiresIn: "1y" })

const sendLoginWithPhoneCode = async (telegramUserId: number, name: string, code: string) => {
  const messageRows = [
    `Здравствуйте, ${name}\n`,
    `Ваш код для входа: ${code}\n`,
    "<i>Этот код будет считаться актуальным <b>1 час</b> (если не запрашивать новый)</i>"
  ]
  await sendTelegramMessage(telegramUserId, messageRows.join("\n"))
}

const generatePasswordRecoveryUrl = (token: string) => `${config.clientUrl}/reset-password/${token}`

const sendPasswordRecoveryUrl = async (target: PasswordRecoveryTarget, name: string, token: string) => {
  const url = generatePasswordRecoveryUrl(token)
  if (target.to === "EMAIL") await sendEmail(target.email, "reset-password", { name, url })
  else {
    const messageRows = [
      `Здравствуйте, ${name}\n`,
      "Был запрошен сброс пароля для привязанного к этому номеру телефона аккаунта в ROVELY",
      "Для завершения перейдите по ссылке ниже и укажите новый пароль:\n",
      `${url}\n`,
      "<i>Ссылка будет считаться актуальной <b>1 час</b> (если не запрашивать новую)\n",
      "Если вы не запрашивали сброс пароля — просто проигнорируйте это сообщение</i>"
    ]
    await sendTelegramMessage(target.telegramUserId, messageRows.join("\n"))
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