import { prisma } from "@/shared/prisma.client.js"
import { AppError } from "@/shared/errors/index.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import { appConfig } from "@/shared/app.config.js"
import { GrammyError } from "grammy"
import { sendTelegramMessage } from "@/shared/bot/bot.service.js"
import { generateSecureCode } from "@/shared/utils/index.js"
import type { VerifyParams, SendParams } from "./phone-verification.types.js"
import type { CheckRegistrationDto } from "./phone-verification.schemas.js"

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
    if (request.updatedAt.getTime() < now - appConfig.verification.phone.codeTtlMs) throw new AppError(ErrorCode.PHONE_VERIFICATION_REQUEST_EXPIRED)
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
    if (request.updatedAt.getTime() < Date.now() - appConfig.verification.phone.codeTtlMs) {
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
      if (request && !request.isConfirmed && request.updatedAt.getTime() > now - appConfig.verification.phone.cooldownMs) {
        const timePassedMs = now - request.updatedAt.getTime()
        const timeLeftMs = appConfig.verification.phone.cooldownMs - timePassedMs
        throw new AppError(ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN, { timeLeftMs })
      }
      if (request?.isConfirmed && request.updatedAt.getTime() > now - appConfig.verification.phone.codeTtlMs) throw new AppError(ErrorCode.PHONE_ALREADY_VERIFIED)
      const code = generateSecureCode()
      await sendCode({
        telegramUserId: link.telegramUserId,
        name: params.name,
        code,
        isNewAccount: !params.accountId
      })
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
      return { timeLeftMs: appConfig.verification.phone.cooldownMs }
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 403) throw new AppError(ErrorCode.TELEGRAM_BOT_BLOCKED)
      throw error
    }
  }
}

const sendCode = async (params: {
  telegramUserId: number,
  name: string,
  code: string,
  isNewAccount: boolean
}) => {
  const messageRows = [
    `Здравствуйте, ${params.name}\n`,
    `Ваш код подтверждения: ${params.code}\n`,
    `<i>Этот код будет считаться актуальным <b>1 час</b> (если не запрашивать новый)${params.isNewAccount
      ? ", после подтверждения номер телефона будет считаться подтвержденным также <b>1 час</b>"
      : ""
    }</i>`
  ]
  await sendTelegramMessage(params.telegramUserId, messageRows.join("\n"))
}