import dotenv from "dotenv"

dotenv.config()

export const config = {
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
    loginWithPhoneCodeTtlMs: 60 * 60 * 1000, // 1 hour
    loginWithPhoneCooldownMs: 60 * 1000, // 1 minute
    passwordRecoveryEmailCooldownMs: 5 * 60 * 1000, // 5 minutes
    passwordRecoveryTelegramMessageCooldownMs: 60 * 1000, // 1 minute
    passwordRecoveryTokenTtlMs: 60 * 60 * 1000 // 1 hour
  },
  verification: {
    email: {
      cooldownMs: 5 * 60 * 1000, // 5 minutes
      tokenTtlMs: 60 * 60 * 1000, // 1 hour
    },
    phone: {
      cooldownMs: 60 * 1000, // 1 minute
      codeTtlMs: 60 * 60 * 1000 // 1 hour
    }
  }
} 