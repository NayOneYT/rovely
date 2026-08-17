import { OAuth2Client } from "google-auth-library"
import { appConfig } from "@/shared/app.config.js"

export const googleClient = new OAuth2Client({
  clientId: appConfig.googleClientId,
  clientSecret: appConfig.googleClientSecret,
  redirectUri: 'postmessage'
})