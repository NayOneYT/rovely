import type { Request, Response, NextFunction } from "express"
import { emailVerificationService } from "./email-verification.service.js"
import type { VerifyDto } from "./email-verification.schemas.js"

export const emailVerificationController = {
  verify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await emailVerificationService.verify(req.params as VerifyDto)
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  },

  checkRegistration: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await emailVerificationService.checkRegistration(req.body)
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  },

  send: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.accountId ? req.accountId : null
      const result = await emailVerificationService.send({ ...req.body, accountId })
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}