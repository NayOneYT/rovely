import { Router } from "express"
import validate from "@/middlewares/validate.js"
import { verifyPhoneSchema, checkRegistrationPhoneVerificationSchema, sendVerificationCodeSchema } from "./schema.js"
import { phoneVerificationController } from "./controller.js"

const router = Router()

router.post("/verify", validate(verifyPhoneSchema, "body"), phoneVerificationController.verifyPhone)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
router.post("/check-verification", validate(checkRegistrationPhoneVerificationSchema, "body"), phoneVerificationController.checkRegistrationPhoneVerification)
router.post("/send", validate(sendVerificationCodeSchema, "body"), phoneVerificationController.sendVerificationCode)

export default router