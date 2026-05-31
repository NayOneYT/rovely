import { Router } from "express"
import { validate } from "@/middlewares/validate.middleware.js"
import { loginSchema, checkSchema, registerSchema, loginWithPhoneSchema, sendLoginWithPhoneCodeSchema } from "./schema.js"
import { authController } from "./controller.js"
import { authMiddleware } from "@/middlewares/auth.middleware.js"

const router = Router()

router.post("/refresh", authController.refresh)
router.post("/login", validate(loginSchema, "body"), authController.login)
router.post("/login-with-phone", validate(loginWithPhoneSchema, "body"), authController.loginWithPhone)
router.post("/login-with-phone/send", validate(sendLoginWithPhoneCodeSchema, "body"), authController.sendLoginWithPhoneCode)
router.get("/check", validate(checkSchema, "query"), authController.check)
router.post("/register", validate(registerSchema, "body"), authController.register)
router.get("/me", authMiddleware, authController.me)
router.post("/logout", authController.logout)

export default router