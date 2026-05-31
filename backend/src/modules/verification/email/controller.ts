import type { Request, Response, NextFunction } from "express"
import { emailVerificationService } from "./service.js"

export const emailVerificationController = {
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.params.token
      const result = await emailVerificationService.verifyEmail(token as string)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  checkRegistrationEmailVerification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.query.email as string
      const result = await emailVerificationService.checkRegistrationEmailVerification(email.toLowerCase())
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