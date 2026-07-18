import { authService } from "./service.js"
import { AppError, ErrorCode } from "@/types/index.js"
import { setTokenCookie, removeTokenCookie } from "@/utils/index.js"
import type { Request, Response, NextFunction } from "express"
import type { CheckPasswordRecoveryTokenDto } from "./schema.js"

export const authController = {
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) throw new AppError(ErrorCode.UNAUTHORIZED)
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

  sendLoginWithPhone: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.sendLoginWithPhone(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  checkAvailability: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.checkAvailability(req.body)
      res.sendStatus(204)
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
      const { isNewAccount, accessToken, refreshToken } = await authService.google(req.body)
      setTokenCookie(res, accessToken, refreshToken, true)
      res.sendStatus(isNewAccount ? 201 : 200)
    } catch (error) {
      next(error)
    }
  },

  getPasswordRecoveryContacts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.getPasswordRecoveryContacts(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  sendPasswordRecovery: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.sendPasswordRecovery(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  checkPasswordRecoveryToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.checkPasswordRecoveryToken(req.params as CheckPasswordRecoveryTokenDto)
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.resetPassword(req.body)
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await authService.me(req.accountId!)
      res.status(200).json(account)
    } catch (error) {
      next(error)
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      removeTokenCookie(res)
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  }
}