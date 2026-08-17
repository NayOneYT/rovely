import { Router } from "express"
import { validationMiddleware, authMiddleware } from "@/shared/middlewares/index.js"
import {
  loginSchema, loginWithPhoneSchema, sendLoginWithPhoneSchema, checkAvailabilitySchema, registerSchema, googleAuthSchema,
  passwordRecoveryContactsSchema, sendPasswordRecoverySchema, checkPasswordRecoveryToken, resetPasswordSchema,
} from "./auth.schemas.js"
import { authController } from "./auth.controller.js"

export const authRouter = Router()

authRouter.post("/refresh", authController.refresh)
authRouter.post("/login", validationMiddleware(loginSchema, "body"), authController.login)
authRouter.post("/login-with-phone", validationMiddleware(loginWithPhoneSchema, "body"), authController.loginWithPhone)
authRouter.post("/login-with-phone/send", validationMiddleware(sendLoginWithPhoneSchema, "body"), authController.sendLoginWithPhone)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
authRouter.post("/check-availability", validationMiddleware(checkAvailabilitySchema, "body"), authController.checkAvailability)
authRouter.post("/register", validationMiddleware(registerSchema, "body"), authController.register)
authRouter.post("/google", validationMiddleware(googleAuthSchema, "body"), authController.google)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
authRouter.post("/password-recovery/contacts", validationMiddleware(passwordRecoveryContactsSchema, "body"), authController.getPasswordRecoveryContacts)
authRouter.post("/password-recovery/send", validationMiddleware(sendPasswordRecoverySchema, "body"), authController.sendPasswordRecovery)
authRouter.get("/password-recovery/check-token/:token", validationMiddleware(checkPasswordRecoveryToken, "params"), authController.checkPasswordRecoveryToken)
authRouter.post("/password-recovery/reset", validationMiddleware(resetPasswordSchema, "body"), authController.resetPassword)
authRouter.get("/me", authMiddleware, authController.me)
authRouter.post("/logout", authMiddleware, authController.logout)