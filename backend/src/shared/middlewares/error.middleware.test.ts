describe("errorMiddleware", () => {
  it.todo("returns a status from errorStatusMap and JSON with code and data for AppError")
  it.todo("returns JSON with only the code when an AppError has no data")
  it.todo("logs the error and returns status 500 with INTERNAL_ERROR when the error isn't an AppError")
})