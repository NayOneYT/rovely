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
  rateLimitingMiddleware({ key: "login", windowMs: 1000 * 60 * 2, limit: 8 }),
  validationMiddleware(loginSchema, "body"),
  authController.login
)

authRouter.post(
  "/login-with-phone",
  rateLimitingMiddleware({ key: "login-with-phone", windowMs: 1000 * 60 * 2, limit: 8 }),
  validationMiddleware(loginWithPhoneSchema, "body"),
  authController.loginWithPhone
)

authRouter.post(
  "/login-with-phone/send",
  rateLimitingMiddleware({
    key: "login-with-phone:send",
    windowMs: appConfig.auth.loginWithPhoneCooldownMs * 2,
    limit: 2
  }),
  validationMiddleware(sendLoginWithPhoneSchema, "body"),
  authController.sendLoginWithPhone
)

// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
authRouter.post(
  "/check-availability",
  rateLimitingMiddleware({ key: "checkAvailability", limit: 50 }),
  validationMiddleware(checkAvailabilitySchema, "body"),
  authController.checkAvailability
)

authRouter.post(
  "/register",
  rateLimitingMiddleware({ key: "register", windowMs: 1000 * 60 * 5, limit: 2 }),
  validationMiddleware(registerSchema, "body"),
  authController.register
)

authRouter.post(
  "/google",
  rateLimitingMiddleware({ key: "google", limit: 3 }),
  validationMiddleware(googleAuthSchema, "body"),
  authController.google
)

// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
authRouter.post(
  "/password-recovery/contacts",
  rateLimitingMiddleware({ key: "password-recovery:contacts", limit: 2 }),
  validationMiddleware(passwordRecoveryContactsSchema, "body"),
  authController.getPasswordRecoveryContacts
)

authRouter.post(
  "/password-recovery/send",
  rateLimitingMiddleware({
    key: "password-recovery:send",
    windowMs: Math.min(
      appConfig.auth.passwordRecoveryEmailCooldownMs,
      appConfig.auth.passwordRecoveryTelegramMessageCooldownMs
    ) * 2,
    limit: 2
  }),
  validationMiddleware(sendPasswordRecoverySchema, "body"),
  authController.sendPasswordRecovery
)

authRouter.get(
  "/password-recovery/check-token/:token",
  rateLimitingMiddleware({ key: "password-recovery:check-token", limit: 10 }),
  validationMiddleware(checkPasswordRecoveryToken, "params"),
  authController.checkPasswordRecoveryToken
)

authRouter.post(
  "/password-recovery/reset",
  rateLimitingMiddleware({ key: "reset-password", windowMs: 1000 * 60 * 2, limit: 2 }),
  validationMiddleware(resetPasswordSchema, "body"),
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