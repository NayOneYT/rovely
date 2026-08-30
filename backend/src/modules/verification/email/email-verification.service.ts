import { redis } from "@/shared/redis.client.js"
import { AppError } from "@/shared/app.error.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import { appConfig } from "@/shared/app.config.js"
import { prisma } from "@/shared/prisma.client.js"
import { sendEmail } from "@/shared/mailer/mailer.service.js"
import { generateSecureToken } from "@/shared/utils/index.js"
import type { VerifyDto, CheckRegistrationDto } from "./email-verification.schemas.js"
import type { EmailVerificationTokenPayload, SendParams } from "./email-verification.types.js"

export const emailVerificationService = {
  verify: async (dto: VerifyDto) => {
    const requestKey = buildRequestKey(dto.token)
    const request = await redis.get(requestKey)
    if (!request) throw new AppError(ErrorCode.EMAIL_VERIFICATION_REQUEST_NOT_FOUND)
    const parsedRequest: EmailVerificationTokenPayload = JSON.parse(request)
    const lowercaseEmail = parsedRequest.email.toLowerCase()
    const tokensKey = buildTokensKey(lowercaseEmail)
    if (parsedRequest.accountId) {
      await prisma.account.update({
        where: {
          id: parsedRequest.accountId
        },
        data: {
          email: parsedRequest.email,
          lowercaseEmail
        }
      })
      const keysToUnlink = new Set<string>()
      keysToUnlink.add(tokensKey)
      const tokens = await redis.smembers(tokensKey)
      tokens.forEach(token => {
        keysToUnlink.add(buildRequestKey(token))
      })
      await redis.unlink(...keysToUnlink)
    }
    else if (parsedRequest.isConfirmed) throw new AppError(ErrorCode.EMAIL_ALREADY_VERIFIED)
    else {
      const tokenPayload: EmailVerificationTokenPayload = {
        email: parsedRequest.email,
        accountId: parsedRequest.accountId,
        isConfirmed: true
      }
      const multi = redis.multi()
      multi.set(
        requestKey, JSON.stringify(tokenPayload),
        "PX", appConfig.verification.email.tokenTtlMs
      )
      multi.pexpire(tokensKey, appConfig.verification.email.tokenTtlMs)
      await multi.exec()
    }
  },

  checkRegistration: async (dto: CheckRegistrationDto) => {
    const tokens = await redis.smembers(buildTokensKey(dto.email))
    if (!tokens.length) throw new AppError(ErrorCode.EMAIL_NOT_VERIFIED)
    const requestKeys = tokens.map(token => buildRequestKey(token))
    const requests = await redis.mget(requestKeys)
    let isConfirmed: boolean = false
    for (const request of requests) {
      if (!request) continue
      const parsedRequest: EmailVerificationTokenPayload = JSON.parse(request)
      if (parsedRequest.isConfirmed) {
        isConfirmed = true
        break
      }
    }
    if (!isConfirmed) throw new AppError(ErrorCode.EMAIL_NOT_VERIFIED)
  },

  send: async (params: SendParams) => {
    const lowercaseEmail = params.email.toLowerCase()
    const tokensKey = buildTokensKey(lowercaseEmail)
    const [account, tokens] = await Promise.all([
      prisma.account.findUnique({
        where: {
          lowercaseEmail
        }
      }),
      redis.smembers(tokensKey)
    ])
    if (account) throw new AppError(ErrorCode.EMAIL_TAKEN)
    let savedRequestKey: string | undefined
    let savedToken: string | undefined
    if (tokens.length > 0) {
      const requestKeys = tokens.map(token => buildRequestKey(token))
      const requests = await redis.mget(requestKeys)
      for (let i = 0; i < requests.length; i++) {
        if (!requests[i]) continue
        const parsedRequest: EmailVerificationTokenPayload = JSON.parse(requests[i]!)
        if (parsedRequest.accountId === params.accountId) {
          savedRequestKey = requestKeys[i]
          savedToken = tokens[i]
          if (parsedRequest.isConfirmed) throw new AppError(ErrorCode.EMAIL_ALREADY_VERIFIED)
          const tokenTtlLeftMs = await redis.pttl(savedRequestKey!)
          const maxTtlForResendMs = appConfig.verification.email.tokenTtlMs - appConfig.verification.email.cooldownMs
          if (tokenTtlLeftMs > maxTtlForResendMs) throw new AppError(ErrorCode.SEND_EMAIL_COOLDOWN, {
            timeLeftMs: tokenTtlLeftMs - maxTtlForResendMs
          })
          break
        }
      }
    }
    const templateId = !!params.accountId
      ? "binding-email"
      : "registration-email"
    const newToken = generateSecureToken()
    const tokenPayload: EmailVerificationTokenPayload = {
      email: params.email,
      accountId: params.accountId,
      isConfirmed: false
    }
    const multi = redis.multi()
    if (savedRequestKey) {
      multi.unlink(savedRequestKey)
      multi.srem(tokensKey, savedToken!)
    }
    multi.sadd(tokensKey, newToken)
    multi.pexpire(tokensKey, appConfig.verification.email.tokenTtlMs)
    multi.set(
      buildRequestKey(newToken), JSON.stringify(tokenPayload),
      "PX", appConfig.verification.email.tokenTtlMs
    )
    await multi.exec()
    await sendEmail({
      email: params.email,
      templateId,
      variables: {
        name: params.name,
        confirm_url: generateUrl(newToken)
      }
    })
    return { timeLeftMs: appConfig.verification.email.cooldownMs }
  }
}

const generateUrl = (token: string) => `${appConfig.clientUrl}/verify-email/${token}`

export const buildTokensKey = (lowercaseEmail: string) => `email-verification-tokens:${lowercaseEmail}`
export const buildRequestKey = (token: string) => `email-verification-request:${token}`