import { redis } from "@/shared/redis.client.js"
import { prisma } from "@/shared/prisma.client.js"
import { AppError } from "@/shared/app.error.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import { appConfig } from "@/shared/app.config.js"
import { GrammyError } from "grammy"
import { sendTelegramMessage } from "@/shared/bot/bot.service.js"
import { generateSecureCode } from "@/shared/utils/index.js"
import type { PhoneVerificationRequestPayload, VerifyParams, SendParams } from "./phone-verification.types.js"
import type { CheckRegistrationDto } from "./phone-verification.schemas.js"

export const phoneVerificationService = {
  verify: async (params: VerifyParams) => {
    const requestKey = buildRequestKey(params.phone, params.accountId)
    const rawRequest = await redis.get(requestKey)
    if (!rawRequest) throw new AppError(ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND)
    const request: PhoneVerificationRequestPayload = JSON.parse(rawRequest)
    if (request.isConfirmed) throw new AppError(ErrorCode.PHONE_ALREADY_VERIFIED)
    if (params.code !== request.code) throw new AppError(ErrorCode.PHONE_VERIFICATION_CODE_INVALID)
    const accountIdsKey = buildAccountIdsKey(params.phone)
    if (!params.accountId) {
      const requestPayload: PhoneVerificationRequestPayload = {
        ...request,
        isConfirmed: true
      }
      await redis.set(
        requestKey, JSON.stringify(requestPayload),
        "PX", appConfig.verification.phone.codeTtlMs
      )
      await redis.pexpire(accountIdsKey, appConfig.verification.phone.codeTtlMs)
    } else {
      await prisma.account.update({
        where: {
          id: params.accountId
        },
        data: {
          phone: params.phone
        }
      })
      const accountIds = await redis.smembers(accountIdsKey)
      await redis.unlink(accountIdsKey, ...accountIds.map(accountId => buildRequestKey(params.phone, accountId)))
    }
  },

  checkRegistration: async (dto: CheckRegistrationDto) => {
    const rawRequest = await redis.get(buildRequestKey(dto.phone, undefined))
    if (!rawRequest) throw new AppError(ErrorCode.PHONE_VERIFICATION_REQUEST_NOT_FOUND)
    const request: PhoneVerificationRequestPayload = JSON.parse(rawRequest)
    if (!request.isConfirmed) throw new AppError(ErrorCode.PHONE_NOT_VERIFIED)
  },

  send: async (params: SendParams) => {
    try {
      const requestKey = buildRequestKey(params.phone, params.accountId)
      const [account, telegramLink, rawRequest, requestTtlLeftMs] = await Promise.all([
        prisma.account.findUnique({
          where: {
            phone: params.phone
          }
        }),
        prisma.telegramLink.findUnique({
          where: {
            phone: params.phone
          }
        }),
        redis.get(requestKey),
        redis.pttl(requestKey)
      ])
      if (account) throw new AppError(ErrorCode.PHONE_TAKEN)
      if (!telegramLink) throw new AppError(ErrorCode.TELEGRAM_LINK_NOT_FOUND)
      if (rawRequest) {
        const maxTtlForResendMs = appConfig.verification.phone.codeTtlMs - appConfig.verification.phone.cooldownMs
        if (requestTtlLeftMs > maxTtlForResendMs) throw new AppError(ErrorCode.SEND_TELEGRAM_MESSAGE_COOLDOWN, {
          timeLeftMs: requestTtlLeftMs - maxTtlForResendMs
        })
        const request: PhoneVerificationRequestPayload = JSON.parse(rawRequest)
        if (request.isConfirmed) throw new AppError(ErrorCode.PHONE_ALREADY_VERIFIED)
      }
      const code = generateSecureCode()
      await sendCode({
        telegramUserId: telegramLink.telegramUserId,
        name: params.name,
        code,
        isNewAccount: !params.accountId
      })
      const requestPayload: PhoneVerificationRequestPayload = {
        code,
        isConfirmed: false
      }
      const accountIdsKey = buildAccountIdsKey(params.phone)
      const multi = redis.multi()
      multi.set(
        requestKey, JSON.stringify(requestPayload),
        "PX", appConfig.verification.phone.codeTtlMs
      )
      multi.sadd(accountIdsKey, String(params.accountId))
      multi.pexpire(accountIdsKey, appConfig.verification.phone.codeTtlMs)
      await multi.exec()
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

export const buildRequestKey = (phone: string, accountId: string | undefined) => {
  return `phone-verification-request:${phone}:${accountId}`
}
export const buildAccountIdsKey = (phone: string) => `phone-verification-account-ids:${phone}`