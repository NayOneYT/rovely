import dotenv from "dotenv"

dotenv.config()

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET as string,
  clientUrl: process.env.CLIENT_URL as string,
  databaseUrl: process.env.DATABASE_URL as string
} 