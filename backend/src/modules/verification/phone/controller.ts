import type { Request, Response, NextFunction } from "express"
import { phoneVerificationService } from "./service.js"

export const phoneVerificationController = {
  verify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await phoneVerificationService.verify(req.body)
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
      const result = await phoneVerificationService.send(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}