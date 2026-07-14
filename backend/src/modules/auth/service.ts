import { AppError } from "@/middlewares/error.js"
import { prisma } from "@/prisma/client.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "@/config/index.js"
import { generateFromEmail, generateUsername } from "unique-username-generator"
import { emailVerificationService } from "@/modules/verification/email/service.js"
import { phoneVerificationService } from "@/modules/verification/phone/service.js"
import { GrammyError } from "grammy"
import { bot } from "@/lib/telegramBot.js"
import { PHONE_CODE_RATE_LIMIT_MS, PHONE_CODE_EXPIRY_MS, PASSWORD_RECOVERY_EMAIL_RATE_LIMIT_MS, PASSWORD_RECOVERY_MESSAGE_RATE_LIMIT_MS, RESET_PASSWORD_TOKEN_EXPIRY_MS } from "@/utils/constants.js"
import { generateCode } from "@/utils/code.js"
import { googleClient } from "@/lib/google.js"
import crypto from "crypto"
import { resend } from "@/lib/email.js"
import type { LoginDto, RegisterDto, LoginWithPhoneDto, SendLoginWithPhoneCodeDto, SendPasswordRecoveryDto, ResetPasswordDto } from "./schema.js"
import type { ContactsDto, SendPasswordRecoveryResultDto } from "./types.js"

const sendCode = async (name: string, telegramUserId: number, code: string) => {
  await bot.api.sendMessage(
    telegramUserId,
    `Здравствуйте, ${name}\n\nВаш код для входа: ${code}\n\n<i>Этот код будет считаться актуальным <b>1 час</b> (если не запрашивать новый)</i>`,
    { parse_mode: "HTML" })
}

const generateUniqueUsername = async (email?: string | null): Promise<string> => {
  let triedUsernames = new Set<string>()
  while (true) {
    let username = email
      ? generateFromEmail(email.toLowerCase(), 3)
      : generateUsername("", 3, 30)
    if (username.length > 30) username = username.slice(0, 27) + username.slice(-3)
    if (triedUsernames.has(username.toLowerCase())) continue
    const account = await prisma.profile.findUnique({
      where: {
        lowercaseUsername: username.toLowerCase()
      }
    })
    if (!account) return username
    triedUsernames.add(username.toLowerCase())
    if (triedUsernames.size > 20) throw new AppError(500, { username: "Ошибка генерации, придумайте username" })
  }
}

const generateToken = () => crypto.randomBytes(32).toString("hex")

const sendPasswordRecoveryEmail = async (to: string, name: string, token: string) => {
  await resend.emails.send({
    to,
    template: {
      id: "reset-password",
      variables: {
        name,
        url: config.nodeEnv === "development" ? `http://localhost:5173/reset-password/${token}` : `https://rovely.org/reset-password/${token}`
      }
    }
  })
}

const sendPasswordRecoveryMessage = async (telegramUserId: number, name: string, token: string) => {
  await bot.api.sendMessage(
    telegramUserId,
    `Здравствуйте, ${name}\n\nБыл запрошен сброс пароля для привязанного к этому номеру телефона аккаунта в ROVELY.\nДля завершения перейдите по ссылке ниже и укажите новый пароль:\n\n${config.nodeEnv === "development" ? `http://localhost:5173/reset-password/${token}` : `https://rovely.org/reset-password/${token}`}\n\n<i>Эта ссылка будет считаться актуальной <b>1 час</b> (если не запрашивать новую)\n\nЕсли вы не запрашивали сброс пароля — просто проигнорируйте это сообщение</i>`,
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
      if (!account) throw new AppError(404, { message: "Аккаунт не найден" })
      const actualPasswordChangedAt = account.passwordChangedAt?.getTime() ?? 0
      if (payload.passwordChangedAt !== actualPasswordChangedAt) throw new AppError(401, { message: "Необходимо заново войти в аккаунт" })
      const accessToken = jwt.sign({ id: payload.id, role: account.role }, config.jwtAccessSecret, { expiresIn: "5m" })
      const newRefreshToken = jwt.sign({ id: payload.id, rememberMe: payload.rememberMe, passwordChangedAt: payload.passwordChangedAt }, config.jwtRefreshSecret, { expiresIn: "1y" })
      return { accessToken, newRefreshToken, rememberMe: payload.rememberMe }
    } catch (error) {
      if (error instanceof AppError) throw error
      if (error instanceof jwt.TokenExpiredError) throw new AppError(401, { message: "Токен истек" })
      throw new AppError(401, { message: "Невалидный токен" })
    }
  },

  login: async (data: LoginDto) => {
    const account = await prisma.account.findFirst({
      where: {
        OR: [
          { login: data.identifier },
          { lowercaseEmail: data.identifier }
        ]
      }
    })
    if (!account) throw new AppError(404, { identifier: "Аккаунт не найден" })
    if (!account.password) throw new AppError(400, { identifier: "Войдите через Google" })
    const isPasswordValid = await bcrypt.compare(data.password, account.password)
    if (!isPasswordValid) throw new AppError(401, { password: "Неверный пароль" })
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
    if (!account) throw new AppError(404, { phone: "Аккаунт не найден" })
    const request = await prisma.loginWithPhoneRequest.findUnique({
      where: {
        phone: data.phone
      }
    })
    const now = new Date()
    if (!request || request.updatedAt.getTime() < now.getTime() - PHONE_CODE_EXPIRY_MS) throw new AppError(!request ? 404 : 410, { code: "Запросите новый код" })
    if (data.code !== request.code) throw new AppError(400, { code: "Неверный код" })
    await prisma.loginWithPhoneRequest.delete({
      where: {
        phone: data.phone
      }
    })
    const accessToken = jwt.sign({ id: account.id, role: account.role }, config.jwtAccessSecret, { expiresIn: "5m" })
    const refreshToken = jwt.sign({ id: account.id, rememberMe: data.rememberMe, passwordChangedAt: account.passwordChangedAt?.getTime() ?? 0 }, config.jwtRefreshSecret, { expiresIn: "1y" })
    return { accessToken, refreshToken, rememberMe: data.rememberMe }
  },

  sendLoginWithPhoneCode: async ({ phone }: SendLoginWithPhoneCodeDto) => {
    try {
      const account = await prisma.account.findUnique({
        where: {
          phone
        },
        include: {
          profile: true
        }
      })
      if (!account) throw new AppError(404, { phone: "Аккаунт не найден" })
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
      if (!link) throw new AppError(404, { phone: "Ошибка привязки номера телефона к Telegram-аккаунту" })
      const now = new Date()
      if (request && request.updatedAt.getTime() > now.getTime() - PHONE_CODE_RATE_LIMIT_MS) {
        const timePassed = now.getTime() - request.updatedAt.getTime()
        const timeLeft = PHONE_CODE_RATE_LIMIT_MS - timePassed
        const secondsLeft = Math.ceil(timeLeft / 1000)
        return { type: "info", message: "Код подтверждения недавно уже был отправлен", secondsLeft }
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
      return { type: "success", message: "Код подтверждения отправлен", secondsLeft: PHONE_CODE_RATE_LIMIT_MS / 1000 }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(403, { message: "Сначала разблокируйте бота" })
      throw error
    }
  },

  check: async (field: string, value: string) => {
    let exists
    switch (field) {
      case "username":
        exists = await prisma.profile.findUnique({
          where: {
            lowercaseUsername: value
          }
        })
        break
      case "email":
        exists = await prisma.account.findUnique({
          where: {
            lowercaseEmail: value
          }
        })
        break
      case "phone":
        exists = await prisma.account.findUnique({
          where: {
            phone: value
          }
        })
        break
      case "login":
        exists = await prisma.account.findUnique({
          where: {
            login: value
          }
        })
        break
    }
    if (exists) throw new AppError(409, { [field]: "Это значение уже используется" })
  },

  register: async (data: RegisterDto) => {
    const lowercaseEmail = data.email ? data.email.toLowerCase() : null
    const orConditions: Array<Record<string, string | Record<string, string>>> = []
    if (data.phone) orConditions.push({ phone: data.phone })
    if (lowercaseEmail) orConditions.push({ lowercaseEmail })
    if (data.login) orConditions.push({ login: data.login })
    if (data.username) orConditions.push({ profile: { lowercaseUsername: data.username.toLowerCase() } })
    const candidate = await prisma.account.findFirst({
      where: {
        OR: orConditions
      }
    })
    if (candidate) {
      if (data.phone && candidate.phone === data.phone) throw new AppError(409, { phone: "Это значение уже используется" })
      else if (lowercaseEmail && candidate.lowercaseEmail === lowercaseEmail) throw new AppError(409, { email: "Это значение уже используется" })
      else if (data.login && candidate.login === data.login) throw new AppError(409, { login: "Это значение уже используется" })
      else throw new AppError(409, { username: "Это значение уже используется" })
    }
    if (data.email) {
      const result = await emailVerificationService.checkRegistrationEmailVerification(lowercaseEmail!)
      if (!result.verified) throw new AppError(422, { email: "Срок подтверждения истек" })
    }
    if (data.phone) {
      const result = await phoneVerificationService.checkRegistrationPhoneVerification(data.phone)
      if (!result.verified) throw new AppError(422, { code: "Срок подтверждения истек" })
    }
    if (!data.username) data.username = await generateUniqueUsername(data.email)
    const hashedPassword = await bcrypt.hash(data.password, 10)
    await prisma.account.create({
      data: {
        phone: data.phone,
        email: data.email,
        lowercaseEmail,
        login: data.login,
        password: hashedPassword,
        profile: {
          create: {
            username: data.username,
            lowercaseUsername: data.username.toLowerCase(),
            name: data.name
          }
        }
      }
    })
    if (data.email) await prisma.verificationEmailRequest.deleteMany({
      where: {
        lowercaseEmail: lowercaseEmail!
      }
    })
    if (data.phone) await prisma.verificationPhoneRequest.deleteMany({
      where: {
        phone: data.phone
      }
    })
  },

  google: async (code: string) => {
    const googleResponse = await googleClient.getToken(code)
    const idToken = googleResponse.tokens.id_token
    if (!idToken) throw new AppError(400, { message: "Google не вернул id_token" })
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId
    })
    const payload = ticket.getPayload()
    if (!payload) throw new AppError(400, { message: "payload для этого id_token пуст" })
    const email = payload.email
    if (!email) throw new AppError(400, { message: "Google для этого аккаунта не предоставляет email" })
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
    let statusCode = 200
    if (!account) {
      statusCode = 201
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
        prisma.verificationEmailRequest.deleteMany({
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
    return { statusCode, accessToken, refreshToken }
  },

  passwordRecoveryContacts: async (identifier: string): Promise<ContactsDto> => {
    const account = await prisma.account.findFirst({
      where: {
        OR: [
          { login: identifier },
          { lowercaseEmail: identifier },
          { phone: identifier }
        ]
      }
    })
    if (!account) throw new AppError(404, { identifier: "Аккаунт не найден" })
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

  sendPasswordRecovery: async (data: SendPasswordRecoveryDto): Promise<SendPasswordRecoveryResultDto> => {
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
      if (!account) throw new AppError(404, { identifier: "Аккаунт не найден" })
      if (to === "EMAIL" && account.email === null) throw new AppError(422, { message: "К этому аккаунту не привязана почта" })
      let telegramUserId: number
      if (to === "PHONE") {
        if (account.phone === null) throw new AppError(422, { message: "К этому аккаунту не привязан номер телефона" })
        const link = await prisma.telegramLink.findUnique({
          where: {
            phone: account.phone
          }
        })
        telegramUserId = link!.telegramUserId
      }
      const request = await prisma.passwordRecoveryRequest.findUnique({
        where: {
          accountId_to: {
            accountId: account.id,
            to
          }
        }
      })
      const now = new Date()
      if (request && request.updatedAt.getTime() > now.getTime() - (to === "EMAIL" ? PASSWORD_RECOVERY_EMAIL_RATE_LIMIT_MS : PASSWORD_RECOVERY_MESSAGE_RATE_LIMIT_MS)) {
        const timePassed = now.getTime() - request.updatedAt.getTime()
        const timeLeft = (to === "EMAIL" ? PASSWORD_RECOVERY_EMAIL_RATE_LIMIT_MS : PASSWORD_RECOVERY_MESSAGE_RATE_LIMIT_MS) - timePassed
        const secondsLeft = Math.ceil(timeLeft / 1000)
        return { statusCode: 429, type: "info", message: `${to === "EMAIL" ? "Письмо" : "Сообщение"} для восстановления недавно уже было отправлено`, to, secondsLeft }
      }
      const token = generateToken()
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
      return { statusCode: 200, type: "success", message: `${to === "EMAIL" ? "Письмо" : "Сообщение"} для восстановления отправленно`, to, secondsLeft: (to === "EMAIL" ? PASSWORD_RECOVERY_EMAIL_RATE_LIMIT_MS / 1000 : PASSWORD_RECOVERY_MESSAGE_RATE_LIMIT_MS / 1000) }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(403, { message: "Сначала разблокируйте бота" })
      throw error
    }
  },

  checkPasswordRecoveryToken: async (token: string) => {
    const request = await prisma.passwordRecoveryRequest.findUnique({
      where: {
        token
      }
    })
    const now = new Date()
    if (!request || request.updatedAt.getTime() < now.getTime() - RESET_PASSWORD_TOKEN_EXPIRY_MS) throw new AppError(request ? 410 : 404, { token: "Токен истек" })
  },

  resetPassword: async (data: ResetPasswordDto) => {
    const request = await prisma.passwordRecoveryRequest.findUnique({
      where: {
        token: data.token
      }
    })
    const now = new Date()
    if (!request || request.updatedAt.getTime() < now.getTime() - RESET_PASSWORD_TOKEN_EXPIRY_MS) throw new AppError(request ? 410 : 404, { token: "Токен истек" })
    const hashedPassword = await bcrypt.hash(data.password, 10)
    await prisma.$transaction([
      prisma.account.update({
        where: {
          id: request.accountId
        },
        data: {
          password: hashedPassword,
          passwordChangedAt: now
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
    if (!account) throw new AppError(401, { message: "Не авторизован" })
    return account
  }
}