import { appConfig } from "@/shared/app.config.js"
import { authService } from "./auth.service.js"
import { AppError } from "@/shared/app.error.js"
import { ErrorCode } from "@shared/error-code.enums.js"
import type { Request, Response, NextFunction } from "express"
import type { CheckPasswordRecoveryTokenDto } from "./auth.schemas.js"

export const authController = {
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) throw new AppError(ErrorCode.UNAUTHORIZED)
      const { accessToken, newRefreshToken, rememberMe } = await authService.refresh(refreshToken)
      setCookie(res, accessToken, newRefreshToken, rememberMe)
      res.sendStatus(200)
    } catch (error) {
      if (error instanceof AppError) removeCookie(res)
      next(error)
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } = await authService.login(req.body)
      setCookie(res, accessToken, refreshToken, req.body.rememberMe)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },

  loginWithPhone: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } = await authService.loginWithPhone(req.body)
      setCookie(res, accessToken, refreshToken, req.body.rememberMe)
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
      const { accessToken, refreshToken, isNewAccount } = await authService.google(req.body)
      setCookie(res, accessToken, refreshToken, true)
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
      const { timeLeftMs } = await authService.checkPasswordRecoveryToken(req.params as CheckPasswordRecoveryTokenDto)
      res.status(200).json({ timeLeftMs })
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
      const result = await authService.me(req.accountId!)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      removeCookie(res)
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  }
}

const cookieOptions = {
  httpOnly: true,
  secure: appConfig.nodeEnv === "production",
  sameSite: appConfig.nodeEnv === "production" ? ("strict" as const) : ("lax" as const)
}

const setCookie = (res: Response, accessToken: string, refreshToken: string, rememberMe: boolean) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    ...(rememberMe ? { maxAge: appConfig.auth.accessTokenTtl } : {})
  })
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    ...(rememberMe ? { maxAge: appConfig.auth.refreshTokenTtl } : {})
  })
}

const removeCookie = (res: Response) => {
  res.clearCookie("accessToken", cookieOptions)
  res.clearCookie("refreshToken", cookieOptions)
}