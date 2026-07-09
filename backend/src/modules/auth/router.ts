import { Router } from "express"
import validate from "@/middlewares/validate.js"
import {
  loginSchema, loginWithPhoneSchema, sendLoginWithPhoneCodeSchema, checkSchema, registerSchema,
  passwordRecoveryContactsSchema, sendPasswordRecoverySchema, checkPasswordRecoveryToken, resetPasswordSchema
} from "./schema.js"
import { authController } from "./controller.js"
import { authMiddleware } from "@/middlewares/auth.js"

const router = Router()

router.post("/refresh", authController.refresh)
router.post("/login", validate(loginSchema, "body"), authController.login)
router.post("/login-with-phone", validate(loginWithPhoneSchema, "body"), authController.loginWithPhone)
router.post("/login-with-phone/send", validate(sendLoginWithPhoneCodeSchema, "body"), authController.sendLoginWithPhoneCode)
router.get("/check", validate(checkSchema, "query"), authController.check)
router.post("/register", validate(registerSchema, "body"), authController.register)
router.post("/google", authController.google)
router.get("/password-recovery/contacts", validate(passwordRecoveryContactsSchema, "query"), authController.passwordRecoveryContacts)
router.post("/password-recovery/send", validate(sendPasswordRecoverySchema, "body"), authController.sendPasswordRecovery)
router.get("/password-recovery/check/:token", validate(checkPasswordRecoveryToken, "params"), authController.checkPasswordRecoveryToken)
router.post("/password-recovery/reset", validate(resetPasswordSchema, "body"), authController.resetPassword)
router.get("/me", authMiddleware, authController.me)
router.post("/logout", authController.logout)

export default router