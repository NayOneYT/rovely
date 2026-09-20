import z from "zod"
import { validationMiddleware, type ValidateTarget } from "./validation.middleware.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import type { Request, Response } from "express"

describe("validationMiddleware", () => {
  it("throws VALIDATION_ERROR with fieldErrors containing only the first error for each field", () => {
    const req = createMockReq("body", invalidData)
    const next = vi.fn()
    expect(() => middleware("body")(req, {} as Response, next)).toThrow(expect.objectContaining({
      errorCode: ErrorCode.VALIDATION_ERROR,
      data: {
        fieldErrors: {
          login: expect.any(String)
        }
      }
    }))
  })

  it("replaces req.body with the parsed data and calls next on success", () => {
    const req = createMockReq("body", validData)
    const next = vi.fn()
    middleware("body")(req, {} as Response, next)
    expect(req.body).toEqual({ login: validData.login.toLowerCase() })
    expect(next).toHaveBeenCalled()
  })

  it("replaces req.params with the parsed data and calls next on success", () => {
    const req = createMockReq("params", validData)
    const next = vi.fn()
    middleware("params")(req, {} as Response, next)
    expect(req.params).toEqual({ login: validData.login.toLowerCase() })
    expect(next).toHaveBeenCalled()
  })

  it("replaces req.query with the parsed data and calls next on success", () => {
    const req = createMockReq("query", validData)
    const next = vi.fn()
    middleware("query")(req, {} as Response, next)
    expect(req.query).toEqual({ login: validData.login.toLowerCase() })
    expect(next).toHaveBeenCalled()
  })
})

const createMockReq = (target: ValidateTarget, data: Record<string, any>) => {
  return { [target]: data } as unknown as Request
}

const schema = z.object({
  login: z
    .string()
    .min(4)
    .toLowerCase()
})

const middleware = (target: ValidateTarget) => validationMiddleware(schema, target)

const invalidData = {
  login: false
}

const validData = {
  login: "USER123"
}