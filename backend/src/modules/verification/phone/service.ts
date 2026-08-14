import { prisma } from "@/shared/prisma.js"
import { AppError, ErrorCode } from "@/shared/types/index.js"
import { config } from "@/shared/config.js"
import { GrammyError } from "grammy"
import { sendMessage } from "@/shared/bot/index.js"
import { generateSecureCode } from "@/shared/utils/index.js"
import type { VerifyParams, SendParams } from "./types.js"
import type { CheckRegistrationDto } from "./schema.js"

export const phoneVerificationService = {
  verify: async (params: VerifyParams) => {
    const request = await prisma.phoneVerificationRequest.findFirst({
      where: {
        phone: params.phone,
        accountId: params.accountId
      }
    })
    if (!request) throw new AppError(ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND)
    const now = Date.now()
    if (request.updatedAt.getTime() < now - config.verification.phone.codeTtlMs) throw new AppError(ErrorCode.PHONE_VERIFICATION_REQUEST_EXPIRED)
    if (request.isConfirmed) throw new AppError(ErrorCode.PHONE_ALREADY_VERIFIED)
    if (request.code !== params.code) throw new AppError(ErrorCode.PHONE_VERIFICATION_CODE_INVALID)
    if (!request.accountId) {
      await prisma.phoneVerificationRequest.update({
        where: {
          id: request.id
        },
        data: {
          isConfirmed: true
        }
      })
      return
    }
    await prisma.$transaction([
      prisma.account.update({
        where: {
          id: request.accountId
        },
        data: {
          phone: params.phone
        }
      }),
      prisma.phoneVerificationRequest.deleteMany({
        where: {
          OR: [
            { accountId: request.accountId },
            { phone: request.phone }
          ]
        }
      })
    ])
  },

  checkRegistration: async (dto: CheckRegistrationDto) => {
    const request = await prisma.phoneVerificationRequest.findFirst({
      where: {
        phone: dto.phone,
        accountId: null
      }
    })
    if (!request) throw new AppError(ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND)
    if (request.updatedAt.getTime() < Date.now() - config.verification.phone.codeTtlMs) {
      const errorCode = request.isConfirmed
        ? ErrorCode.PHONE_VERIFICATION_EXPIRED
        : ErrorCode.PHONE_VERIFICATION_REQUEST_EXPIRED
      throw new AppError(errorCode)
    }
    if (!request.isConfirmed) throw new AppError(ErrorCode.PHONE_NOT_VERIFIED)
  },

  send: async (params: SendParams) => {
    try {
      const [account, request, link] = await Promise.all([
        prisma.account.findUnique({
          where: {
            phone: params.phone
          }
        }),
        prisma.phoneVerificationRequest.findFirst({
          where: {
            phone: params.phone,
            accountId: params.accountId
          }
        }),
        prisma.telegramLink.findUnique({
          where: {
            phone: params.phone
          }
        })
      ])
      if (account) throw new AppError(ErrorCode.PHONE_TAKEN)
      if (!link) throw new AppError(ErrorCode.TELEGRAM_LINK_NOT_FOUND)
      const now = Date.now()
      if (request && !request.isConfirmed && request.updatedAt.getTime() > now - config.verification.phone.cooldownMs) {
        const timePassedMs = now - request.updatedAt.getTime()
        const timeLeftMs = config.verification.phone.cooldownMs - timePassedMs
        throw new AppError(ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN, { timeLeftMs })
      }
      if (request?.isConfirmed && request.updatedAt.getTime() > now - config.verification.phone.codeTtlMs) throw new AppError(ErrorCode.PHONE_ALREADY_VERIFIED)
      const code = generateSecureCode()
      await sendCode(link.telegramUserId, params.name, code, !params.accountId)
      const updateData = request?.isConfirmed
        ? { code, isConfirmed: false }
        : { code }
      request
        ? await prisma.phoneVerificationRequest.update({
          where: {
            id: request.id
          },
          data: updateData
        })
        : await prisma.phoneVerificationRequest.create({
          data: {
            code,
            phone: params.phone,
            accountId: params.accountId
          }
        })
      return { timeLeftMs: config.verification.phone.cooldownMs }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(ErrorCode.TELEGRAM_BOT_BLOCKED)
      throw error
    }
  }
}

const sendCode = async (telegramUserId: number, name: string, code: string, isNewAccount: boolean) => {
  const messageRows = [
    `Здравствуйте, ${name}\n`,
    `Ваш код подтверждения: ${code}\n`,
    `<i>Этот код будет считаться актуальным <b>1 час</b> (если не запрашивать новый)${isNewAccount
      ? ", после подтверждения номер телефона будет считаться подтвержденным также <b>1 час</b>"
      : ""
    }</i>`
  ]
  await sendMessage(telegramUserId, messageRows.join("\n"))
}