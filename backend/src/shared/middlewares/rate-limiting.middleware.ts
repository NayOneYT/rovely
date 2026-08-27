import { redis } from "../redis.client.js"
import { AppError } from "../app.error.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import type { Request, Response, NextFunction } from "express"

export const rateLimitingMiddleware = (params: {
  key: string
  windowMs?: number
  limit: number
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.accountId ?? req.ip
    const finalKey = `rl:${params.key}:${identifier}`
    try {
      const [isBlocked, timeBeforeMs] = await redis.eval(
        `
        local key = KEYS[1]
        local windowMs = tonumber(ARGV[1])
        local limit = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])

        local removeBefore = now - windowMs
        redis.call("ZREMRANGEBYSCORE", key, 0, removeBefore)

        local requestsCount = redis.call("ZCARD", key)
        if requestsCount < limit then
            redis.call("ZADD", key, now, now .. ":" .. math.random(1, 999999))
            redis.call("PEXPIRE", key, windowMs)
            return { false }
        else
            local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
            local oldestTimestamp = tonumber(oldest[2])
            local timeBeforeMs = (oldestTimestamp + windowMs) - now
            return { true, timeBeforeMs }
        end
        `,
        1,
        finalKey,
        params.windowMs ?? 1000 * 60, // default is 1 minute
        params.limit,
        Date.now()
      ) as [boolean, number?]
      if (isBlocked) {
        res.setHeader("Retry-After", Math.ceil(timeBeforeMs! / 1000))
        throw new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, { timeBeforeMs })
      } else next()
    } catch (error) {
      next(error)
    }
  }
}