import express from "express"
import { config } from "./config/index.js"
import authRouter from "./modules/auth/router.js"
import { errorHandler } from "./middlewares/error.middleware.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import emailVerificationRouter from "./modules/verification/email/router.js"
import phoneVerificationRouter from "./modules/verification/phone/router.js"
import { bot } from "./lib/telegramBot.js"
import "./modules/verification/phone/telegramBot/handler.js"

const app = express()

bot.start().catch((error) => {
  console.error(`Ошибка при запуске Telegram-бота: ${error}`)
})

app.use(express.json())
app.use(cookieParser())

if (config.nodeEnv !== "production") {
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }))
}

app.use("/api/auth", authRouter)
app.use("/api/verification/email", emailVerificationRouter)
app.use("/api/verification/phone", phoneVerificationRouter)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Cервер запущен на http://localhost:${config.port}`)
})

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());