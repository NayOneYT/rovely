import { config } from "@/config/index.js"
import type { Response } from "express"

export const setTokenCookie = (res: Response, accessToken: string, refreshToken: string, rememberMe: boolean) => {
  const isProd = config.nodeEnv === "production"
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("strict" as const) : ("lax" as const)
  }
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    ...(rememberMe ? { maxAge: 5 * 60 * 1000 } : {})
  })
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    ...(rememberMe ? { maxAge: 365 * 24 * 60 * 1000 } : {})
  })
}

export const removeTokenCookie = (res: Response) => {
  res.clearCookie("accessToken")
  res.clearCookie("refreshToken")
}