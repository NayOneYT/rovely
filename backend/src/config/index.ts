import dotenv from "dotenv"

dotenv.config()

export const config = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  clientUrl: process.env.CLIENT_URL as string,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  resendApiKey: process.env.RESEND_API_KEY as string
} 