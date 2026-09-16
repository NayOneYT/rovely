import { ErrorCode } from "@shared/error-code.enums.js"
import { AppError } from "@/shared/app.error.js"
import { errorMiddleware, errorStatusMap } from "./error.middleware.js"
import type { Request, Response, NextFunction } from "express"

describe("errorMiddleware", () => {
  it("returns a status from errorStatusMap and JSON with code and data for AppError", () => {
    const res = createMockRes()
    const error = new AppError(ErrorCode.ACCOUNT_NOT_FOUND, { someField: 123 })
    errorMiddleware(error, {} as Request, res, {} as NextFunction)
    expect(res.status).toHaveBeenCalledWith(errorStatusMap[error.errorCode])
    expect(res.json).toHaveBeenCalledWith({ code: error.errorCode, someField: 123 })
  })

  it("returns JSON with only the code when an AppError has no data", () => {
    const res = createMockRes()
    const error = new AppError(ErrorCode.PASSWORD_INVALID)
    errorMiddleware(error, {} as Request, res, {} as NextFunction)
    expect(res.json).toHaveBeenCalledWith({ code: error.errorCode })
  })

  it("logs the error and returns status 500 with INTERNAL_ERROR when the error isn't an AppError", () => {
    const res = createMockRes()
    const error = new Error()
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { })
    errorMiddleware(error, {} as Request, res, {} as NextFunction)
    expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ code: ErrorCode.INTERNAL_ERROR })
  })
})

const createMockRes = () => {
  const json = vi.fn()
  return { status: vi.fn().mockReturnValue({ json }), json } as unknown as Response & { json: ReturnType<typeof vi.fn> }
}