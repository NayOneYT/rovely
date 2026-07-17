import { Router } from "express"
import { emailVerificationRouter } from "./email/router.js"
import { phoneVerificationRouter } from "./phone/router.js"

export const verificationRouter = Router()

verificationRouter.use("/email", emailVerificationRouter)
verificationRouter.use("/phone", phoneVerificationRouter)