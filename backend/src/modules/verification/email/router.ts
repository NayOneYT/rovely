import { Router } from "express"
import { validate } from "@/shared/middlewares/index.js"
import { verifySchema, checkRegistrationSchema, sendSchema } from "./schema.js"
import { emailVerificationController } from "./controller.js"

export const emailVerificationRouter = Router()

emailVerificationRouter.post("/verify/:token", validate(verifySchema, "params"), emailVerificationController.verify)
// the route accepts data in the request body rather than the query string to ensure the security of users' sensitive data
emailVerificationRouter.post("/check", validate(checkRegistrationSchema, "body"), emailVerificationController.checkRegistration)
emailVerificationRouter.post("/send", validate(sendSchema, "body"), emailVerificationController.send)