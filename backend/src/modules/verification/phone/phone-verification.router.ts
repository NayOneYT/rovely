import { Router } from "express"
import { validationMiddleware, rateLimitingMiddleware, optionalAuthMiddleware } from "@/shared/middlewares/index.js"
import { verifySchema, checkRegistrationSchema, sendSchema } from "./phone-verification.schemas.js"
import { phoneVerificationController } from "./phone-verification.controller.js"
import { appConfig } from "@/shared/app.config.js"

export const phoneVerificationRouter = Router()

phoneVerificationRouter.post(
  "/verify",
  optionalAuthMiddleware,
  rateLimitingMiddleware({ key: "phone-verification:verify", windowMs: 1000 * 60 * 2, limit: 6 }),
  validationMiddleware(verifySchema, "body"),
  phoneVerificationController.verify
)

// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
phoneVerificationRouter.post(
  "/check",
  rateLimitingMiddleware({ key: "phone-verification:check", limit: 10 }),
  validationMiddleware(checkRegistrationSchema, "body"),
  phoneVerificationController.checkRegistration
)

phoneVerificationRouter.post(
  "/send",
  optionalAuthMiddleware,
  rateLimitingMiddleware({
    key: "phone-verification:send",
    windowMs: appConfig.verification.phone.cooldownMs * 2,
    limit: 2
  }),
  validationMiddleware(sendSchema, "body"),
  phoneVerificationController.send
)