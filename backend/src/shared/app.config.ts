import dotenv from "dotenv"

dotenv.config()

export const appConfig = {
  nodeEnv: process.env.NODE_ENV,
  clientUrl: process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://rovely.org",
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  resendApiKey: process.env.RESEND_API_KEY as string,
  botToken: process.env.BOT_TOKEN as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  auth: {
    loginWithPhoneCodeTtlMs: 1000 * 60 * 60, // 1 hour
    loginWithPhoneCooldownMs: 1000 * 60, // 1 minute
    passwordRecoveryEmailCooldownMs: 1000 * 60 * 5, // 5 minutes
    passwordRecoveryTelegramMessageCooldownMs: 1000 * 60, // 1 minute
    passwordRecoveryTokenTtlMs: 1000 * 60 * 60, // 1 hour
    accessTokenTtl: 1000 * 60 * 5, // 5 minutes
    refreshTokenTtl: 1000 * 60 * 60 * 24 * 365 // 1 year 
  },
  verification: {
    email: {
      cooldownMs: 1000 * 60 * 5, // 5 minutes
      tokenTtlMs: 1000 * 60 * 60, // 1 hour
    },
    phone: {
      cooldownMs: 1000 * 60, // 1 minute
      codeTtlMs: 1000 * 60 * 60 // 1 hour
    }
  },
  redisUrl: process.env.REDIS_URL as string
} 