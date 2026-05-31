import type { Request, Response, NextFunction } from "express"
import { phoneVerificationService } from "./service.js"
import parsePhoneNumberFromString from "libphonenumber-js"

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
      const phone = req.query.phone as string
      const parsedPhone = parsePhoneNumberFromString(phone)!.number
      const result = await phoneVerificationService.checkRegistrationPhoneVerification(parsedPhone)
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