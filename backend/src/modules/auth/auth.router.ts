import { Router } from "express"
import { validationMiddleware, rateLimitingMiddleware, authMiddleware } from "@/shared/middlewares/index.js"
import {
  loginSchema, loginWithPhoneSchema, sendLoginWithPhoneSchema, checkAvailabilitySchema, registerSchema, googleAuthSchema,
  passwordRecoveryContactsSchema, sendPasswordRecoverySchema, checkPasswordRecoveryToken, resetPasswordSchema,
} from "./auth.schemas.js"
import { authController } from "./auth.controller.js"
import { appConfig } from "@/shared/app.config.js"

export const authRouter = Router()

authRouter.post(
  "/refresh",
  rateLimitingMiddleware({ key: "refresh", limit: 10 }),
  authController.refresh
)

authRouter.post(
  "/login",
  validationMiddleware(loginSchema, "body"),
  rateLimitingMiddleware({ key: "login", windowSec: 60 * 2, limit: 8 }),
  authController.login
)

authRouter.post(
  "/login-with-phone",
  validationMiddleware(loginWithPhoneSchema, "body"),
  rateLimitingMiddleware({ key: "login-with-phone", windowSec: 60 * 2, limit: 8 }),
  authController.loginWithPhone
)

authRouter.post(
  "/login-with-phone/send",
  validationMiddleware(sendLoginWithPhoneSchema, "body"),
  rateLimitingMiddleware({
    key: "login-with-phone:send",
    windowSec: Math.ceil(appConfig.auth.loginWithPhoneCooldownMs / 1000) * 2,
    limit: 2
  }),
  authController.sendLoginWithPhone
)

// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
authRouter.post(
  "/check-availability",
  validationMiddleware(checkAvailabilitySchema, "body"),
  rateLimitingMiddleware({ key: "checkAvailability", limit: 50 }),
  authController.checkAvailability
)

authRouter.post(
  "/register",
  validationMiddleware(registerSchema, "body"),
  rateLimitingMiddleware({ key: "register", windowSec: 60 * 5, limit: 2 }),
  authController.register
)

authRouter.post(
  "/google",
  validationMiddleware(googleAuthSchema, "body"),
  rateLimitingMiddleware({ key: "google", limit: 3 }),
  authController.google
)

// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
authRouter.post(
  "/password-recovery/contacts",
  validationMiddleware(passwordRecoveryContactsSchema, "body"),
  rateLimitingMiddleware({ key: "password-recovery:contacts", limit: 2 }),
  authController.getPasswordRecoveryContacts
)

authRouter.post(
  "/password-recovery/send",
  validationMiddleware(sendPasswordRecoverySchema, "body"),
  rateLimitingMiddleware({
    key: "password-recovery:send",
    windowSec: Math.min(
      Math.ceil(appConfig.auth.passwordRecoveryEmailCooldownMs / 1000),
      Math.ceil(appConfig.auth.passwordRecoveryTelegramMessageCooldownMs / 1000)
    ) * 2,
    limit: 2
  }),
  authController.sendPasswordRecovery
)

authRouter.get(
  "/password-recovery/check-token/:token",
  validationMiddleware(checkPasswordRecoveryToken, "params"),
  rateLimitingMiddleware({ key: "password-recovery:check-token", limit: 10 }),
  authController.checkPasswordRecoveryToken
)

authRouter.post(
  "/password-recovery/reset",
  validationMiddleware(resetPasswordSchema, "body"),
  rateLimitingMiddleware({ key: "reset-password", windowSec: 60 * 2, limit: 2 }),
  authController.resetPassword
)

authRouter.get(
  "/me",
  authMiddleware,
  rateLimitingMiddleware({ key: "me", limit: 50 }),
  authController.me
)

authRouter.post(
  "/logout",
  authMiddleware,
  rateLimitingMiddleware({ key: "logout", limit: 3 }),
  authController.logout
)