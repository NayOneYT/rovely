import { Router } from "express"
import { validationMiddleware, rateLimitingMiddleware, optionalAuthMiddleware } from "@/shared/middlewares/index.js"
import { verifySchema, checkRegistrationSchema, sendSchema } from "./email-verification.schemas.js"
import { emailVerificationController } from "./email-verification.controller.js"
import { appConfig } from "@/shared/app.config.js"

export const emailVerificationRouter = Router()

emailVerificationRouter.post(
  "/verify/:token",
  rateLimitingMiddleware({ key: "email-verification:verify", limit: 10 }),
  validationMiddleware(verifySchema, "params"),
  emailVerificationController.verify
)

// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
emailVerificationRouter.post(
  "/check",
  rateLimitingMiddleware({ key: "email-verification:check", limit: 10 }),
  validationMiddleware(checkRegistrationSchema, "body"),
  emailVerificationController.checkRegistration
)

emailVerificationRouter.post(
  "/send",
  optionalAuthMiddleware,
  rateLimitingMiddleware({
    key: "email-verification:send",
    windowSec: Math.ceil(appConfig.verification.email.cooldownMs / 1000) * 2,
    limit: 2
  }),
  validationMiddleware(sendSchema, "body"),
  emailVerificationController.send
)