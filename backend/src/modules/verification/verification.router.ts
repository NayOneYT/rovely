import { Router } from "express"
import { emailVerificationRouter } from "./email/email-verification.router.js"
import { phoneVerificationRouter } from "./phone/phone-verification.router.js"

export const verificationRouter = Router()

verificationRouter.use("/email", emailVerificationRouter)
verificationRouter.use("/phone", phoneVerificationRouter)