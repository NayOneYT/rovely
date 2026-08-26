import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible"
import { redis } from "../redis.client.js"
import { AppError } from "../app.error.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import type { Request, Response, NextFunction } from "express"

export const rateLimitMiddleware = (params: {
  key: string
  windowSec: number
  limit: number
}) => {
  const limiter = new RateLimiterRedis({
    storeClient: redis,
    points: params.limit,
    duration: params.windowSec,
    keyPrefix: "rl"
  })

  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.accountId ?? req.ip
    try {
      await limiter.consume(`${params.key}:${identifier}`)
      next()
    } catch (error) {
      if (error instanceof RateLimiterRes) {
        res.setHeader("Retry-After", Math.ceil(error.msBeforeNext / 1000))
        next(new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, { timeLeftMs: error.msBeforeNext }))
        return
      }
      next(error)
    }
  }
}