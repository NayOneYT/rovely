import { Router } from "express"
import { validate } from "@/middlewares/index.js"
import { verifySchema, checkRegistrationSchema, sendSchema } from "./schema.js"
import { phoneVerificationController } from "./controller.js"

export const phoneVerificationRouter = Router()

phoneVerificationRouter.post("/verify", validate(verifySchema, "body"), phoneVerificationController.verify)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
phoneVerificationRouter.post("/check", validate(checkRegistrationSchema, "body"), phoneVerificationController.checkRegistration)
phoneVerificationRouter.post("/send", validate(sendSchema, "body"), phoneVerificationController.send)