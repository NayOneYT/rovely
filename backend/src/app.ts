import express from "express"
import cookieParser from "cookie-parser"
import { authRouter } from "./modules/auth/auth.router.js"
import { verificationRouter } from "./modules/verification/verification.router.js"
import { errorMiddleware } from "./shared/middlewares/index.js"

export const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/verification", verificationRouter)
app.use(errorMiddleware)