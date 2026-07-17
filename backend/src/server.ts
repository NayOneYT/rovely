import app from "./app.js"
import { config } from "./config/index.js"
import { bot } from "./modules/bot/client.js"

try {
  bot.start().catch((error) => {
    console.error(`Critical error when launching the Telegram bot: ${error}`)
    process.exit(1)
  })
  console.log("The Telegram bot has been launched.")

  const server = app.listen(config.port, () => {
    console.log(`The server is running on http://localhost:${config.port}`)
  })

  const gracefulShutdown = () => {
    bot.stop()
    server.close(() => process.exit(0))
  }

  process.once("SIGINT", gracefulShutdown);
  process.once("SIGTERM", gracefulShutdown);
} catch (error) {
  console.error(`Critical error during server startup: ${error}`)
  process.exit(1)
}