import { Router } from "express"
import { validate } from "@/middlewares/validate.middleware.js"
import { checkRegistrationPhoneVerificationSchema, sendVerificationCodeSchema, verifyPhoneSchema } from "./schema.js"
import { phoneVerificationController } from "./controller.js"

const router = Router()

router.post("/verify", validate(verifyPhoneSchema, "body"), phoneVerificationController.verifyPhone)
router.get("/check", validate(checkRegistrationPhoneVerificationSchema, "query"), phoneVerificationController.checkRegistrationPhoneVerification)
router.post("/send", validate(sendVerificationCodeSchema, "body"), phoneVerificationController.sendVerificationCode)

export default router