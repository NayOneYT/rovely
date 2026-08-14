import type { Request, Response, NextFunction } from "express"
import { phoneVerificationService } from "./service.js"

export const phoneVerificationController = {
  verify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.accountId ? req.accountId : null
      await phoneVerificationService.verify({ ...req.body, accountId })
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  },

  checkRegistration: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await phoneVerificationService.checkRegistration(req.body)
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  },

  send: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.accountId ? req.accountId : null
      const result = await phoneVerificationService.send({ ...req.body, accountId })
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}