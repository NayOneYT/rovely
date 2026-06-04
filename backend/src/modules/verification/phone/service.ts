import { prisma } from "@/prisma/client.js"
import { AppError } from "@/middlewares/error.middleware.js"
import { bot } from "@/lib/telegramBot.js"
import { GrammyError } from "grammy"
import { PHONE_CODE_RATE_LIMIT_MS, PHONE_CODE_EXPIRY_MS } from "@/utils/constants.js"
import { generateCode } from "@/utils/code.js"
import type { SendVerificationCodeDto, VerifyPhoneDto } from "./schema.js"

const sendCode = async (name: string, telegramUserId: number, code: string, accountId: string) => {
  await bot.api.sendMessage(
    telegramUserId,
    `Здравствуйте, ${name}\n\nВаш код подтверждения: ${code}\n\n<i>Этот код будет считаться актуальным <b>1 час</b> (если не запрашивать новый)` + (accountId === "none"
      ? `, после подтверждения номер телефона будет считаться подтвержденным также <b>1 час</b>.</i>`
      : ".</i>"),
    { parse_mode: "HTML" })
}

export const phoneVerificationService = {
  verifyPhone: async (data: VerifyPhoneDto) => {
    const request = await prisma.verificationPhoneRequest.findUnique({
      where: {
        phone_accountId: {
          phone: data.phone,
          accountId: data.accountId
        }
      }
    })
    const now = new Date()
    if (!request || request.updatedAt.getTime() < now.getTime() - PHONE_CODE_EXPIRY_MS) throw new AppError(!request ? 404 : 410, { code: "Запросите новый код" })
    if (request.isConfirmed) return { type: "info", message: "Этот номер телефона уже подтвержден" }
    if (request.code === data.code) {
      if (request.accountId === "none") {
        await prisma.verificationPhoneRequest.update({
          where: {
            phone_accountId: {
              phone: data.phone,
              accountId: data.accountId
            }
          },
          data: {
            isConfirmed: true
          }
        })
        return { type: "success", message: "Номер телефона успешно подтвержден" }
      }
      await Promise.all([
        prisma.account.update({
          where: {
            id: data.accountId
          },
          data: {
            phone: data.phone
          }
        }),
        prisma.verificationPhoneRequest.deleteMany({
          where: {
            OR: [
              { accountId: data.accountId },
              { phone: data.phone }
            ]
          }
        })
      ])
    }
    throw new AppError(400, { code: "Неверный код" })
  },

  checkRegistrationPhoneVerification: async (phone: string) => {
    const request = await prisma.verificationPhoneRequest.findUnique({
      where: {
        phone_accountId: {
          phone,
          accountId: "none"
        }
      }
    })
    return { verified: !!request?.isConfirmed && request.updatedAt.getTime() > new Date().getTime() - PHONE_CODE_EXPIRY_MS }
  },

  sendVerificationCode: async (data: SendVerificationCodeDto) => {
    try {
      const account = await prisma.account.findUnique({
        where: {
          phone: data.phone
        }
      })
      if (account) throw new AppError(409, { phone: "Это значение уже используется" })
      const [request, link] = await Promise.all([
        prisma.verificationPhoneRequest.findUnique({
          where: {
            phone_accountId: {
              phone: data.phone,
              accountId: data.accountId
            }
          }
        }),
        prisma.telegramLink.findUnique({
          where: {
            phone: data.phone
          }
        })
      ])
      if (!link) return { type: "warning", message: "Сначала отправьте свой номер телефона боту" }
      const now = new Date()
      if (request && !request.isConfirmed && request.updatedAt.getTime() > now.getTime() - PHONE_CODE_RATE_LIMIT_MS) {
        const timePassed = now.getTime() - request.updatedAt.getTime()
        const timeLeft = PHONE_CODE_RATE_LIMIT_MS - timePassed
        const secondsLeft = Math.ceil(timeLeft / 1000)
        return { type: "info", message: "Код подтверждения недавно уже был отправлен", secondsLeft }
      }
      if (request?.isConfirmed && request.updatedAt.getTime() > now.getTime() - PHONE_CODE_EXPIRY_MS) throw new AppError(409, { phone: "Этот номер телефона уже подтвержден" })
      const code = generateCode()
      await sendCode(data.name, link.telegramUserId, code, data.accountId)
      const updateData = (request?.isConfirmed && request.updatedAt.getTime() < now.getTime() - PHONE_CODE_EXPIRY_MS)
        ? { code, isConfirmed: false }
        : { code }
      if (request) {
        await prisma.verificationPhoneRequest.update({
          where: {
            phone_accountId: {
              phone: data.phone,
              accountId: data.accountId
            }
          },
          data: updateData
        })
      } else {
        await prisma.verificationPhoneRequest.create({
          data: {
            code,
            phone: data.phone,
            accountId: data.accountId
          }
        })
      }
      return { type: "success", message: "Код подтверждения отправлен", secondsLeft: PHONE_CODE_RATE_LIMIT_MS / 1000 }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(403, { message: "Сначала разблокируйте бота" })
      throw error
    }
  },

  checkTelegramLink: async (telegramUserId: number) => {
    const link = await prisma.telegramLink.findUnique({
      where: {
        telegramUserId
      }
    })
    return !!link
  },

  saveTelegramLink: async (phone: string, telegramUserId: number) => {
    await prisma.telegramLink.create({
      data: {
        phone,
        telegramUserId
      }
    })
  }
}