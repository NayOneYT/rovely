import { prisma } from "@/prisma/client.js"
import { AppError, ErrorCode } from "@/types/index.js"
import { config } from "@/config/index.js"
import { sendEmail } from "@/modules/mailer/service.js"
import {
  generateSecureToken,
  EMAIL_RATE_LIMIT_MS, EMAIL_TOKEN_EXPIRY_MS
} from "@/utils/index.js"
import type { VerifyDto, CheckRegistrationDto, SendDto } from "./schema.js"

const generateUrl = (token: string) => `${config.clientUrl}/verification/email/verify/${token}`

export const emailVerificationService = {
  verify: async (data: VerifyDto) => {
    const request = await prisma.emailVerificationRequest.findUnique({
      where: {
        token: data.token
      }
    })
    if (!request) throw new AppError(404, ErrorCode.EMAIL_VERIFICATION_REQUEST_NOT_FOUND)
    const now = Date.now()
    if (request.updatedAt.getTime() < now - EMAIL_TOKEN_EXPIRY_MS) throw new AppError(410, ErrorCode.EMAIL_VERIFICATION_REQUEST_EXPIRED)
    if (request.isConfirmed) throw new AppError(409, ErrorCode.EMAIL_ALREADY_VERIFIED)
    if (request.accountId === "none") {
      await prisma.emailVerificationRequest.update({
        where: {
          token: data.token
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
    const request = await prisma.emailVerificationRequest.findUnique({
      where: {
        lowercaseEmail_accountId: {
          lowercaseEmail: data.email,
          accountId: "none"
        }
      }
    })
    if (!request) throw new AppError(404, ErrorCode.EMAIL_VERIFICATION_REQUEST_NOT_FOUND)
    if (request.updatedAt.getTime() < Date.now() - EMAIL_TOKEN_EXPIRY_MS) {
      const errorCode = request.isConfirmed
        ? ErrorCode.EMAIL_VERIFICATION_EXPIRED
        : ErrorCode.EMAIL_VERIFICATION_REQUEST_EXPIRED
      throw new AppError(410, errorCode)
    }
    if (!request.isConfirmed) throw new AppError(422, ErrorCode.EMAIL_NOT_VERIFIED)
  },

  send: async (data: SendDto) => {
    const [account, request] = await Promise.all([
      prisma.account.findUnique({
        where: {
          lowercaseEmail: data.email.toLowerCase()
        }
      }),
      prisma.emailVerificationRequest.findUnique({
        where: {
          lowercaseEmail_accountId: {
            lowercaseEmail: data.email.toLowerCase(),
            accountId: data.accountId
          }
        }
      })
    ])
    if (account) throw new AppError(409, ErrorCode.EMAIL_TAKEN)
    const now = Date.now()
    const token = generateSecureToken()
    if (request && !request.isConfirmed && request.updatedAt.getTime() > now - EMAIL_RATE_LIMIT_MS) {
      const timePassedMs = now - request.updatedAt.getTime()
      const timeLeftMs = EMAIL_RATE_LIMIT_MS - timePassedMs
      throw new AppError(429, ErrorCode.SEND_EMAIL_COOLDOWN, { timeLeftMs })
    }
    if (request?.isConfirmed && request.updatedAt.getTime() > now - EMAIL_TOKEN_EXPIRY_MS) throw new AppError(409, ErrorCode.EMAIL_ALREADY_VERIFIED)
    const templateId = data.accountId === "none"
      ? "registration-email"
      : "binding-email"
    const updateData = request?.isConfirmed
      ? { token, isConfirmed: false }
      : { token }
    await Promise.all([
      sendEmail(data.email, templateId, { name: data.name, confirm_url: generateUrl(token) }),
      request
        ? prisma.emailVerificationRequest.update({
          where: {
            lowercaseEmail_accountId: {
              lowercaseEmail: data.email.toLowerCase(),
              accountId: data.accountId
            }
          },
          data: updateData
        })
        : prisma.emailVerificationRequest.create({
          data: {
            token,
            email: data.email,
            lowercaseEmail: data.email.toLowerCase(),
            accountId: data.accountId
          }
        })
    ])
    return { timeLeftMs: EMAIL_RATE_LIMIT_MS }
  }
}