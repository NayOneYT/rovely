import { prisma } from "@/prisma/client.js"
import { AppError, ErrorCode } from "@/types/index.js"
import { GrammyError } from "grammy"
import { sendMessage } from "@/modules/bot/service.js"
import {
  generateSecureCode,
  PHONE_CODE_RATE_LIMIT_MS, PHONE_CODE_EXPIRY_MS
} from "@/utils/index.js"
import type { SendDto, CheckRegistrationDto, VerifyDto } from "./schema.js"

const sendCode = async (telegramUserId: number, name: string, code: string, isNewAccount: boolean) => {
  const messageRows = [
    `Здравствуйте, ${name}\n`,
    `Ваш код подтверждения: ${code}\n`,
    `<i>Этот код будет считаться актуальным <b>1 час</b> (если не запрашивать новый)${isNewAccount
      ? ", после подтверждения номер телефона будет считаться подтвержденным также <b>1 час</b>"
      : ""
    }.</i>`
  ]
  await sendMessage(telegramUserId, messageRows.join("\n"))
}

export const phoneVerificationService = {
  verify: async (data: VerifyDto) => {
    const request = await prisma.phoneVerificationRequest.findUnique({
      where: {
        phone_accountId: {
          phone: data.phone,
          accountId: data.accountId
        }
      }
    })
    if (!request) throw new AppError(404, ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND)
    const now = Date.now()
    if (request.updatedAt.getTime() < now - PHONE_CODE_EXPIRY_MS) throw new AppError(410, ErrorCode.PHONE_VERIFICATION_REQUEST_EXPIRED)
    if (request.isConfirmed) throw new AppError(409, ErrorCode.PHONE_ALREADY_VERIFIED)
    if (request.code !== data.code) throw new AppError(422, ErrorCode.PHONE_VERIFICATION_CODE_INVALID)
    if (request.accountId === "none") {
      return await prisma.phoneVerificationRequest.update({
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
    }
    await prisma.$transaction([
      prisma.account.update({
        where: {
          id: data.accountId
        },
        data: {
          phone: data.phone
        }
      }),
      prisma.phoneVerificationRequest.deleteMany({
        where: {
          OR: [
            { accountId: data.accountId },
            { phone: data.phone }
          ]
        }
      })
    ])
  },

  checkRegistration: async (data: CheckRegistrationDto) => {
    const request = await prisma.phoneVerificationRequest.findUnique({
      where: {
        phone_accountId: {
          phone: data.phone,
          accountId: "none"
        }
      }
    })
    if (!request) throw new AppError(404, ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND)
    if (request.updatedAt.getTime() < Date.now() - PHONE_CODE_EXPIRY_MS) {
      const errorCode = request.isConfirmed
        ? ErrorCode.PHONE_VERIFICATION_EXPIRED
        : ErrorCode.PHONE_VERIFICATION_REQUEST_EXPIRED
      throw new AppError(410, errorCode)
    }
    if (!request.isConfirmed) throw new AppError(422, ErrorCode.PHONE_NOT_VERIFIED)
  },

  send: async (data: SendDto) => {
    try {
      const [account, request, link] = await Promise.all([
        prisma.account.findUnique({
          where: {
            phone: data.phone
          }
        }),
        prisma.phoneVerificationRequest.findUnique({
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
      if (account) throw new AppError(409, ErrorCode.PHONE_TAKEN)
      if (!link) throw new AppError(404, ErrorCode.TELEGRAM_LINK_NOT_FOUND)
      const now = Date.now()
      if (request && !request.isConfirmed && request.updatedAt.getTime() > now - PHONE_CODE_RATE_LIMIT_MS) {
        const timePassedMs = now - request.updatedAt.getTime()
        const timeLeftMs = PHONE_CODE_RATE_LIMIT_MS - timePassedMs
        throw new AppError(429, ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN, { timeLeftMs })
      }
      if (request?.isConfirmed && request.updatedAt.getTime() > now - PHONE_CODE_EXPIRY_MS) throw new AppError(409, ErrorCode.PHONE_ALREADY_VERIFIED)
      const code = generateSecureCode()
      await sendCode(link.telegramUserId, data.name, code, data.accountId === "none")
      const updateData = request?.isConfirmed
        ? { code, isConfirmed: false }
        : { code }
      request
        ? await prisma.phoneVerificationRequest.update({
          where: {
            phone_accountId: {
              phone: data.phone,
              accountId: data.accountId
            }
          },
          data: updateData
        })
        : await prisma.phoneVerificationRequest.create({
          data: {
            code,
            phone: data.phone,
            accountId: data.accountId
          }
        })
      return { timeLeftMs: PHONE_CODE_RATE_LIMIT_MS }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(403, ErrorCode.TELEGRAM_BOT_BLOCKED)
      throw error
    }
  }
}