import { Router } from "express"
import validate from "@/middlewares/validate.js"
import { verifyEmailSchema, checkRegistrationEmailVerificationSchema, sendVerificationEmailSchema } from "./schema.js"
import { emailVerificationController } from "./controller.js"

const router = Router()

router.post("/verify/:token", validate(verifyEmailSchema, "params"), emailVerificationController.verifyEmail)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
router.post("/check-verification", validate(checkRegistrationEmailVerificationSchema, "body"), emailVerificationController.checkRegistrationEmailVerification)
router.post("/send", validate(sendVerificationEmailSchema, "body"), emailVerificationController.sendVerificationEmail)

export default router