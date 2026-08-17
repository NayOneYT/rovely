import { Router } from "express"
import { validationMiddleware, optionalAuthMiddleware } from "@/shared/middlewares/index.js"
import { verifySchema, checkRegistrationSchema, sendSchema } from "./phone-verification.schemas.js"
import { phoneVerificationController } from "./phone-verification.controller.js"

export const phoneVerificationRouter = Router()

phoneVerificationRouter.post("/verify", validationMiddleware(verifySchema, "body"), optionalAuthMiddleware, phoneVerificationController.verify)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
phoneVerificationRouter.post("/check", validationMiddleware(checkRegistrationSchema, "body"), phoneVerificationController.checkRegistration)
phoneVerificationRouter.post("/send", validationMiddleware(sendSchema, "body"), optionalAuthMiddleware, phoneVerificationController.send)