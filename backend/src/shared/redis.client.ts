import { Redis } from "ioredis"
import { appConfig } from "./app.config.js"

export const redis = new Redis(appConfig.redisUrl)

redis.on("connect", () => console.log("Redis connected"))
redis.on("error", (error) => console.error(`Redis connection error: ${error}`))