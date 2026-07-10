import type { Request, Response, NextFunction } from "express"
import { phoneVerificationService } from "./service.js"

export const phoneVerificationController = {
  verifyPhone: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await phoneVerificationService.verifyPhone(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  checkRegistrationPhoneVerification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await phoneVerificationService.checkRegistrationPhoneVerification(req.body.phone as string)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  },

  sendVerificationCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await phoneVerificationService.sendVerificationCode(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}