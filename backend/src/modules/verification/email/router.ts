import { Router } from "express"
import validate from "@/middlewares/validate.js"
import { verifySchema, checkRegistrationSchema, sendSchema } from "./schema.js"
import { emailVerificationController } from "./controller.js"

const router = Router()

router.post("/verify/:token", validate(verifySchema, "params"), emailVerificationController.verify)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
router.post("/check", validate(checkRegistrationSchema, "body"), emailVerificationController.checkRegistration)
router.post("/send", validate(sendSchema, "body"), emailVerificationController.send)

export default router