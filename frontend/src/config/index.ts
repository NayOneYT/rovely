import dotenv from "dotenv"

dotenv.config()

export const config = {
  googleClientId: process.env.GOOGLE_CLIENT_ID as string
} 