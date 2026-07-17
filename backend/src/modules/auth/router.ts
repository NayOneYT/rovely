import { Router } from "express"
import { validate } from "@/middlewares/validate.js"
import {
  loginSchema, loginWithPhoneSchema, sendLoginWithPhoneSchema, checkAvailabilitySchema, registerSchema, googleAuthSchema,
  passwordRecoveryContactsSchema, sendPasswordRecoverySchema, checkPasswordRecoveryToken, resetPasswordSchema,
} from "./schema.js"
import { authController } from "./controller.js"
import { authMiddleware } from "@/middlewares/auth.js"

export const authRouter = Router()

authRouter.post("/refresh", authController.refresh)
authRouter.post("/login", validate(loginSchema, "body"), authController.login)
authRouter.post("/login-with-phone", validate(loginWithPhoneSchema, "body"), authController.loginWithPhone)
authRouter.post("/login-with-phone/send", validate(sendLoginWithPhoneSchema, "body"), authController.sendLoginWithPhone)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
authRouter.post("/check-availability", validate(checkAvailabilitySchema, "body"), authController.checkAvailability)
authRouter.post("/register", validate(registerSchema, "body"), authController.register)
authRouter.post("/google", validate(googleAuthSchema, "body"), authController.google)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
authRouter.post("/password-recovery/contacts", validate(passwordRecoveryContactsSchema, "body"), authController.getPasswordRecoveryContacts)
authRouter.post("/password-recovery/send", validate(sendPasswordRecoverySchema, "body"), authController.sendPasswordRecovery)
authRouter.get("/password-recovery/check-token/:token", validate(checkPasswordRecoveryToken, "params"), authController.checkPasswordRecoveryToken)
authRouter.post("/password-recovery/reset", validate(resetPasswordSchema, "body"), authController.resetPassword)
authRouter.get("/me", authMiddleware, authController.me)
authRouter.post("/logout", authController.logout)