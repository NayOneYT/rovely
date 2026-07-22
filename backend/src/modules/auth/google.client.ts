import { OAuth2Client } from "google-auth-library"
import { config } from "@/shared/config.js"

export const googleClient = new OAuth2Client({
  clientId: config.googleClientId,
  clientSecret: config.googleClientSecret,
  redirectUri: 'postmessage'
})