import { app } from "./app.js"
import { appConfig } from "./shared/app.config.js"
import { bot } from "./shared/bot/bot.client.js"
import { registerBotHandlers } from "./modules/bot/index.js"
import { redis } from "./shared/redis.client.js"

try {
  registerBotHandlers()
  bot.start()
    .then(() => {
      console.log("The Telegram bot has been launched.")
    })
    .catch((error) => {
      console.error(`Critical error when launching the Telegram bot: ${error}`)
      process.exit(1)
    })

  const server = app.listen(appConfig.port, () => {
    console.log(`The server is running on http://localhost:${appConfig.port}`)
  })

  const gracefulShutdown = async () => {
    try {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve(undefined))
      })
      await bot.stop()
      await redis.quit()
      process.exit(0)
    } catch (error) {
      console.error(`Error during graceful shutdown: ${error}`)
      process.exit(1)
    }
  }

  process.once("SIGINT", gracefulShutdown);
  process.once("SIGTERM", gracefulShutdown);
} catch (error) {
  console.error(`Critical error during server startup: ${error}`)
  process.exit(1)
}