import { Router } from "express"
import { validationMiddleware, optionalAuthMiddleware } from "@/shared/middlewares/index.js"
import { verifySchema, checkRegistrationSchema, sendSchema } from "./email-verification.schemas.js"
import { emailVerificationController } from "./email-verification.controller.js"

export const emailVerificationRouter = Router()

emailVerificationRouter.post("/verify/:token", validationMiddleware(verifySchema, "params"), emailVerificationController.verify)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
emailVerificationRouter.post("/check", validationMiddleware(checkRegistrationSchema, "body"), emailVerificationController.checkRegistration)
emailVerificationRouter.post("/send", validationMiddleware(sendSchema, "body"), optionalAuthMiddleware, emailVerificationController.send)