import { AppError } from "@/middlewares/error.middleware.js"
import { prisma } from "@/prisma/client.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "@/config/index.js"
import { generateFromEmail, generateUsername } from "unique-username-generator"
import { emailVerificationService } from "@/modules/verification/email/service.js"
import { phoneVerificationService } from "@/modules/verification/phone/service.js"
import { GrammyError } from "grammy"
import { bot } from "@/lib/telegramBot.js"
import { PHONE_CODE_RATE_LIMIT_MS, PHONE_CODE_EXPIRY_MS } from "@/utils/constants.js"
import { generateCode } from "@/utils/code.js"
import type { LoginDto, RegisterDto, LoginWithPhoneDto, SendLoginWithPhoneCodeDto } from "./schema.js"

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