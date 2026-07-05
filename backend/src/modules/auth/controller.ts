import { authService } from "./service.js"
import { AppError } from "@/middlewares/error.middleware.js"
import { setTokenCookie, removeTokenCookie } from "@/utils/cookie.js"
import type { Request, Response, NextFunction } from "express"
import type { CheckDto, PasswordRecoveryIdentifyDto, SendPasswordRecoveryDto, ResetPasswordDto } from "./schema.js"

export const authController = {
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) throw new AppError(401, { message: "Не авторизован" })
      const { accessToken, newRefreshToken, rememberMe } = await authService.refresh(refreshToken)
      setTokenCookie(res, accessToken, newRefreshToken, rememberMe)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken, rememberMe } = await authService.login(req.body)
      setTokenCookie(res, accessToken, refreshToken, rememberMe)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },

  loginWithPhone: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken, rememberMe } = await authService.loginWithPhone(req.body)
      setTokenCookie(res, accessToken, refreshToken, rememberMe)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },

  sendLoginWithPhoneCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.sendLoginWithPhoneCode(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  check: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as CheckDto
      const field = query.field
      const value = query.value.toLowerCase()
      await authService.check(field, value)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },

  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.register(req.body)
      res.sendStatus(201)
    } catch (error) {
      next(error)
    }
  },

  google: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.body.code
      const { statusCode, accessToken, refreshToken } = await authService.google(code)
      setTokenCookie(res, accessToken, refreshToken, true)
      res.sendStatus(statusCode)
    } catch (error) {
      next(error)
    }
  },

  passwordRecoveryIdentify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.passwordRecoveryIdentify(req.query as PasswordRecoveryIdentifyDto)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  sendPasswordRecovery: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { statusCode, ...result } = await authService.sendPasswordRecovery(req.body)
      res.status(statusCode).json(result)
    } catch (error) {
      next(error)
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.resetPassword(req.body)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.accountId) throw new AppError(401, { message: "Не авторизован" })
      const account = await authService.me(req.accountId)
      res.status(200).json(account)
    } catch (error) {
      next(error)
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      removeTokenCookie(res)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
}