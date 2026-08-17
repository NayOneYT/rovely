import { resend } from "./mailer.client.js"

export const sendEmail = async (params: {
  email: string,
  templateId: string,
  variables: Record<string, string>
}) => {
  await resend.emails.send({
    to: params.email,
    template: {
      id: params.templateId,
      variables: params.variables
    }
  })
}