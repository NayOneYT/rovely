import { app } from "./app.js"
import { appConfig } from "./shared/app.config.js"
import { bot } from "./shared/bot/bot.client.js"
import { registerBotHandlers } from "./modules/bot/index.js"

try {
  registerBotHandlers()
  bot.start().catch((error) => {
    console.error(`Critical error when launching the Telegram bot: ${error}`)
    process.exit(1)
  })
  console.log("The Telegram bot has been launched.")

  const server = app.listen(appConfig.port, () => {
    console.log(`The server is running on http://localhost:${appConfig.port}`)
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