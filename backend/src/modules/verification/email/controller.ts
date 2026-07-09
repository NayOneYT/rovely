import type { Request, Response, NextFunction } from "express"
import { emailVerificationService } from "./service.js"

export const emailVerificationController = {
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailVerificationService.verifyEmail(req.params.token as string)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  checkRegistrationEmailVerification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailVerificationService.checkRegistrationEmailVerification(req.query.email as string)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  sendVerificationEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailVerificationService.sendVerificationEmail(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}