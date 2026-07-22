import { prisma } from "@/shared/prisma.js"
import { AppError, ErrorCode } from "@/shared/types/index.js"
import { config } from "@/shared/config.js"
import { sendEmail } from "@/shared/mailer/index.js"
import { generateSecureToken } from "@/shared/utils/index.js"
import type { VerifyDto, CheckRegistrationDto, SendDto } from "./schema.js"

export const emailVerificationService = {
  verify: async (data: VerifyDto) => {
    const request = await prisma.emailVerificationRequest.findUnique({
      where: {
        token: data.token
      }
    })
    if (!request) throw new AppError(ErrorCode.EMAIL_VERIFICATION_REQUEST_NOT_FOUND)
    const now = Date.now()
    if (request.updatedAt.getTime() < now - config.verification.email.tokenTtlMs) throw new AppError(ErrorCode.EMAIL_VERIFICATION_REQUEST_EXPIRED)
    if (request.isConfirmed) throw new AppError(ErrorCode.EMAIL_ALREADY_VERIFIED)
    if (!request.accountId) {
      await prisma.emailVerificationRequest.update({
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
          email: request.email,
          lowercaseEmail: request.lowercaseEmail
        }
      }),
      prisma.emailVerificationRequest.deleteMany({
        where: {
          OR: [
            { accountId: request.accountId },
            { lowercaseEmail: request.lowercaseEmail }
          ]
        }
      })
    ])
  },

  checkRegistration: async (data: CheckRegistrationDto) => {
    const request = await prisma.emailVerificationRequest.findFirst({
      where: {
        lowercaseEmail: data.email,
        accountId: null
      }
    })
    if (!request) throw new AppError(ErrorCode.EMAIL_VERIFICATION_REQUEST_NOT_FOUND)
    if (request.updatedAt.getTime() < Date.now() - config.verification.email.tokenTtlMs) {
      const errorCode = request.isConfirmed
        ? ErrorCode.EMAIL_VERIFICATION_EXPIRED
        : ErrorCode.EMAIL_VERIFICATION_REQUEST_EXPIRED
      throw new AppError(errorCode)
    }
    if (!request.isConfirmed) throw new AppError(ErrorCode.EMAIL_NOT_VERIFIED)
  },

  send: async (data: SendDto) => {
    const lowercaseEmail = data.email.toLowerCase()
    const [account, request] = await Promise.all([
      prisma.account.findUnique({
        where: {
          lowercaseEmail
        }
      }),
      prisma.emailVerificationRequest.findFirst({
        where: {
          lowercaseEmail,
          accountId: data.accountId
        }
      })
    ])
    if (account) throw new AppError(ErrorCode.EMAIL_TAKEN)
    const now = Date.now()
    if (request && !request.isConfirmed && request.updatedAt.getTime() > now - config.verification.email.cooldownMs) {
      const timePassedMs = now - request.updatedAt.getTime()
      const timeLeftMs = config.verification.email.cooldownMs - timePassedMs
      throw new AppError(ErrorCode.SEND_EMAIL_COOLDOWN, { timeLeftMs })
    }
    if (request?.isConfirmed && request.updatedAt.getTime() > now - config.verification.email.tokenTtlMs) throw new AppError(ErrorCode.EMAIL_ALREADY_VERIFIED)
    const templateId = data.accountId
      ? "binding-email"
      : "registration-email"
    const token = generateSecureToken()
    const updateData = request?.isConfirmed
      ? { token, isConfirmed: false }
      : { token }
    await Promise.all([
      sendEmail(data.email, templateId, { name: data.name, confirm_url: generateUrl(token) }),
      request
        ? prisma.emailVerificationRequest.update({
          where: {
            id: request.id
          },
          data: updateData
        })
        : prisma.emailVerificationRequest.create({
          data: {
            token,
            email: data.email,
            lowercaseEmail,
            accountId: data.accountId
          }
        })
    ])
    return { timeLeftMs: config.verification.email.cooldownMs }
  }
}

const generateUrl = (token: string) => `${config.clientUrl}/verification/email/verify/${token}`