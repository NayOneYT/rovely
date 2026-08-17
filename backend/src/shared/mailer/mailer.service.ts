import { resend } from "./mailer.client.js"

export const sendEmail = async (email: string, templateId: string, variables: Record<string, string>) => {
  await resend.emails.send({
    to: email,
    template: {
      id: templateId,
      variables: variables
    }
  })
}