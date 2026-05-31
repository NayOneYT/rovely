import { Router } from "express"
import { emailVerificationController } from "./controller.js"
import { validate } from "@/middlewares/validate.middleware.js"
import { checkRegistrationEmailVerificationSchema, sendVerificationEmailSchema, verifyEmailSchema } from "./schema.js"

const router = Router()

router.get("/verify/:token", validate(verifyEmailSchema, "params"), emailVerificationController.verifyEmail)
router.get("/check", validate(checkRegistrationEmailVerificationSchema, "query"), emailVerificationController.checkRegistrationEmailVerification)
router.post("/send", validate(sendVerificationEmailSchema, "body"), emailVerificationController.sendVerificationEmail)

export default router