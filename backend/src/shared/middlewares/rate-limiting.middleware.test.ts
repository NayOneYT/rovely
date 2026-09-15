import { rateLimitingMiddleware } from "./rate-limiting.middleware.js"
import { redis } from "@/shared/redis.client.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import type { Request, Response } from "express"

beforeEach(() => vi.restoreAllMocks())

describe("rateLimitingMiddleware", () => {
  it("uses accountId as the identifier for Redis key when it's set", async () => {
    const req = createMockReq(accountId)
    const next = vi.fn()
    await rateLimitingMiddleware({ key, limit })(req, {} as Response, next)
    const exists = await redis.exists(buildRlKey(accountId))
    expect(exists).toBe(1)
  })

  it("uses the IP as the identifier for Redis key when accountId isn't set", async () => {
    const req = createMockReq()
    const next = vi.fn()
    await rateLimitingMiddleware({ key, limit })(req, {} as Response, next)
    const exists = await redis.exists(buildRlKey(ip))
    expect(exists).toBe(1)
  })

  it("uses a default windowMs of 1 minute when it's not provided", async () => {
    const req = createMockReq()
    const next = vi.fn()
    const redisEvalSpy = vi.spyOn(redis, "eval")
    await rateLimitingMiddleware({ key, limit })(req, {} as Response, next)
    expect(redisEvalSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      60000,
      expect.anything(),
      expect.anything()
    )
  })

  it("creates a new record in Redis when the limit isn't exceeded and calls the next function", async () => {
    const rlKey = buildRlKey(ip)
    const requestsBefore = await redis.zcard(rlKey)
    const req = createMockReq()
    const next = vi.fn()
    await rateLimitingMiddleware({ key, limit })(req, {} as Response, next)
    const requestsAfter = await redis.zcard(rlKey)
    expect(requestsAfter).toBe(requestsBefore + 1)
    expect(next).toHaveBeenCalled()
  })

  it("allows a request again after the window has passed", async () => {
    const req = createMockReq()
    const next = vi.fn()
    const middleware = rateLimitingMiddleware({ key, windowMs: 100, limit })
    await middleware(req, {} as Response, next)
    const firstRequestEndsMs = Date.now()
    expect(next).toHaveBeenCalledWith()
    next.mockClear()
    await new Promise((resolve) => setTimeout(resolve, firstRequestEndsMs + 100 - Date.now()))
    await middleware(req, {} as Response, next)
    expect(next).toHaveBeenCalledWith()
  })

  it("sets Retry-After and throws RATE_LIMIT_EXCEEDED with timeLeftMs when the limit is exceeded", async () => {
    const req = createMockReq()
    const res = createMockRes()
    const next = vi.fn()
    const middleware = rateLimitingMiddleware({ key, limit })
    await middleware(req, res, next)
    next.mockClear()
    await middleware(req, res, next)
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", expect.anything())
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      errorCode: ErrorCode.RATE_LIMIT_EXCEEDED,
      data: { timeBeforeMs: expect.anything() }
    }))
  })
})

const accountId = "account123"
const ip = "127.0.0.1"
const key = "login"
const limit = 1

const createMockReq = (accountId?: string) => {
  return { ip, accountId } as unknown as Request
}

const buildRlKey = (identifier: string) => `rl:${key}:${identifier}`

const createMockRes = () => {
  return { setHeader: vi.fn() } as unknown as Response
}