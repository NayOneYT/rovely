import { prisma } from "@/prisma/client.js"
import { AppError } from "@/middlewares/error.middleware.js"
import crypto from "crypto"
import { resend } from "@/lib/email.js"
import { config } from "@/config/index.js"
import { EMAIL_RATE_LIMIT_MS, EMAIL_TOKEN_EXPIRY_MS } from "@/utils/constants.js"
import type { SendVerificationEmailDto } from "./schema.js"

const generateToken = () => crypto.randomBytes(32).toString("hex")

const sendEmail = async (name: string, to: string, accountId: string, token: string) => {
  await resend.emails.send({
    to,
    template: {
      id: accountId === "none" ? "registration-email" : "binding-email",
      variables: {
        name,
        confirm_url: config.nodeEnv === "development" ? `http://localhost:5173/verification/email/verify/${token}` : `https://rovely.org/verification/email/verify/${token}`
      }
    }
  })
}

export const emailVerificationService = {
  verifyEmail: async (token: string) => {
    const request = await prisma.verificationEmailRequest.findUnique({
      where: {
        token
      }
    })
    const now = new Date()
    if (!request || request.updatedAt.getTime() < now.getTime() - EMAIL_TOKEN_EXPIRY_MS) throw new AppError(!request ? 404 : 410, { token: "Ссылка недействительна" })
    if (request.isConfirmed) return { message: "Эта почта уже подтверждена" }
    if (request.accountId === "none") {
      await prisma.verificationEmailRequest.update({
        where: {
          token
        },
        data: {
          isConfirmed: true
        }
      })
      return { message: "Почта успешно подтверждена, можете продолжать регистрацию" }
    }
    await Promise.all([
      prisma.account.update({
        where: {
          id: request.accountId
        },
        data: {
          email: request.email,
          lowercaseEmail: request.lowercaseEmail
        }
      }),
      prisma.verificationEmailRequest.deleteMany({
        where: {
          OR: [
            { accountId: request.accountId },
            { lowercaseEmail: request.lowercaseEmail }
          ]
        }
      })
    ])
    return { message: "Почта успешно привязана" }
  },

  checkRegistrationEmailVerification: async (email: string) => {
    const request = await prisma.verificationEmailRequest.findUnique({
      where: {
        lowercaseEmail_accountId: {
          lowercaseEmail: email,
          accountId: "none"
        }
      }
    })
    return { verified: !!request?.isConfirmed && request.updatedAt.getTime() > new Date().getTime() - EMAIL_TOKEN_EXPIRY_MS }
  },

  sendVerificationEmail: async (data: SendVerificationEmailDto) => {
    const account = await prisma.account.findUnique({
      where: {
        lowercaseEmail: data.email.toLowerCase()
      }
    })
    if (account) throw new AppError(409, { email: "Это значение уже используется" })
    const request = await prisma.verificationEmailRequest.findUnique({
      where: {
        lowercaseEmail_accountId: {
          lowercaseEmail: data.email.toLowerCase(),
          accountId: data.accountId
        }
      }
    })
    const now = new Date()
    const token = generateToken()
    if (request && !request.isConfirmed && request.updatedAt.getTime() > now.getTime() - EMAIL_RATE_LIMIT_MS) {
      const timePassed = now.getTime() - request.updatedAt.getTime()
      const timeLeft = EMAIL_RATE_LIMIT_MS - timePassed
      const secondsLeft = Math.ceil(timeLeft / 1000)
      return { type: "info", message: "На эту почту недавно уже было отправлено письмо", secondsLeft }
    }
    if (request?.isConfirmed && request.updatedAt.getTime() > now.getTime() - EMAIL_TOKEN_EXPIRY_MS) throw new AppError(409, { email: "Эта почта уже подтверждена" })
    const updateData = (request?.isConfirmed && request.updatedAt.getTime() < now.getTime() - EMAIL_TOKEN_EXPIRY_MS)
      ? { token, isConfirmed: false }
      : { token }
    await Promise.all([
      sendEmail(data.name, data.email, data.accountId, token),
      request
        ? prisma.verificationEmailRequest.update({
          where: {
            lowercaseEmail_accountId: {
              lowercaseEmail: data.email.toLowerCase(),
              accountId: data.accountId
            }
          },
          data: updateData
        })
        : prisma.verificationEmailRequest.create({
          data: {
            token,
            email: data.email,
            lowercaseEmail: data.email.toLowerCase(),
            accountId: data.accountId
          }
        })
    ])
    return { type: "success", message: "Письмо для подтверждения отправлено", secondsLeft: EMAIL_RATE_LIMIT_MS / 1000 }
  }
}