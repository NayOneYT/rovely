import { authMiddleware, optionalAuthMiddleware, handleError } from "./auth.middleware.js"
import { AppError } from "@/shared/app.error.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import jwt from "jsonwebtoken"
import type { Request, Response } from "express"

describe("authMiddleware", () => {
  it("calls next with UNAUTHORIZED when accessToken isn't set in the cookies", () => {
    const req = createMockReq()
    const next = vi.fn()
    authMiddleware(req, {} as Response, next)
    expect(next).toHaveBeenCalledWith(new AppError(ErrorCode.UNAUTHORIZED))
  })

  it("calls next with ACCESS_TOKEN_EXPIRED when accessToken is expired", () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.TokenExpiredError("", new Date())
    })
    const req = createMockReq("token")
    const next = vi.fn()
    authMiddleware(req, {} as Response, next)
    expect(next).toHaveBeenCalledWith(new AppError(ErrorCode.ACCESS_TOKEN_EXPIRED))
  })

  it("calls next with ACCESS_TOKEN_INVALID for an incorrect accessToken", () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.JsonWebTokenError("")
    })
    const req = createMockReq("token")
    const next = vi.fn()
    authMiddleware(req, {} as Response, next)
    expect(next).toHaveBeenCalledWith(new AppError(ErrorCode.ACCESS_TOKEN_INVALID))
  })

  it("saves accountId to the request and calls next", () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      return { id: 1 }
    })
    const req = createMockReq("token")
    const next = vi.fn()
    authMiddleware(req, {} as Response, next)
    expect(req).toHaveProperty("accountId", 1)
    expect(next).toHaveBeenCalledWith()
  })
})

describe("optionalAuthMiddleware", () => {
  it("calls next with ACCESS_TOKEN_EXPIRED when accessToken is expired", () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.TokenExpiredError("", new Date())
    })
    const req = createMockReq("token")
    const next = vi.fn()
    optionalAuthMiddleware(req, {} as Response, next)
    expect(next).toHaveBeenCalledWith(new AppError(ErrorCode.ACCESS_TOKEN_EXPIRED))
  })

  it("calls next with ACCESS_TOKEN_INVALID for an incorrect accessToken", () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.JsonWebTokenError("")
    })
    const req = createMockReq("token")
    const next = vi.fn()
    optionalAuthMiddleware(req, {} as Response, next)
    expect(next).toHaveBeenCalledWith(new AppError(ErrorCode.ACCESS_TOKEN_INVALID))
  })

  it("saves accountId to the request when it's provided and calls next", () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      return { id: 1 }
    })
    const req = createMockReq("token")
    const next = vi.fn()
    optionalAuthMiddleware(req, {} as Response, next)
    expect(req).toHaveProperty("accountId", 1)
    expect(next).toHaveBeenCalledWith()
  })

  it("calls next when accessToken doesn't exist", () => {
    const req = createMockReq()
    const next = vi.fn()
    optionalAuthMiddleware(req, {} as Response, next)
    expect(next).toHaveBeenCalledWith()
  })
})

describe("handleError", () => {
  it("calls next with ACCESS_TOKEN_EXPIRED for jwt.TokenExpiredError", () => {
    const next = vi.fn()
    handleError(new jwt.TokenExpiredError("", new Date()), next)
    expect(next).toHaveBeenCalledWith(new AppError(ErrorCode.ACCESS_TOKEN_EXPIRED))
  })

  it("calls next with ACCESS_TOKEN_INVALID for jwt.JsonWebTokenError", () => {
    const next = vi.fn()
    handleError(new jwt.JsonWebTokenError(""), next)
    expect(next).toHaveBeenCalledWith(new AppError(ErrorCode.ACCESS_TOKEN_INVALID))
  })

  it("calls next with any other error", () => {
    const next = vi.fn()
    const unknownError = new Error()
    handleError(unknownError, next)
    expect(next).toHaveBeenCalledWith(unknownError)
  })
})

const createMockReq = (accessToken?: string): Request => {
  return { cookies: { accessToken } } as unknown as Request
}