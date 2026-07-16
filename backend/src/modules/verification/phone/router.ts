import { Router } from "express"
import validate from "@/middlewares/validate.js"
import { verifySchema, checkRegistrationSchema, sendSchema } from "./schema.js"
import { phoneVerificationController } from "./controller.js"

const router = Router()

router.post("/verify", validate(verifySchema, "body"), phoneVerificationController.verify)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
router.post("/check", validate(checkRegistrationSchema, "body"), phoneVerificationController.checkRegistration)
router.post("/send", validate(sendSchema, "body"), phoneVerificationController.send)

export default router