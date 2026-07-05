import express from "express"
import authRouter from "./modules/auth/router.js"
import { errorHandler } from "./middlewares/error.middleware.js"
import cookieParser from "cookie-parser"
import emailVerificationRouter from "./modules/verification/email/router.js"
import phoneVerificationRouter from "./modules/verification/phone/router.js"

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/verification/email", emailVerificationRouter)
app.use("/api/verification/phone", phoneVerificationRouter)
app.use(errorHandler)

export default app