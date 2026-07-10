type AppErrorData = {
  message?: string
  fieldErrors?: Record<string, string>
  [key: string]: any
}

export class AppError extends Error {
  constructor(public statusCode: number, public data: AppErrorData) {
    super()
    this.name = "AppError"
  }
}