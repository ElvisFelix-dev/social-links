import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendWelcomeEmail = async ({ name, email }) => {
  return resend.emails.send({
    from: "GRSA <onboarding@resend.dev>", // email precisa estar verificado na Resend
    to: email,
    subject: 'Bem-vindo ao Social Links 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Olá, ${name}! 👋</h2>
        <p>Que bom ter você no <strong>Social Links</strong>.</p>
        <p>
          Agora você pode centralizar todos os seus links em um só lugar
          e compartilhar seu perfil facilmente.
        </p>
        <p>
          🚀 Crie, edite e personalize seus links quando quiser.
        </p>
        <br />
        <p>Qualquer dúvida, é só responder este e-mail 😉</p>
        <strong>Equipe Social Links</strong>
      </div>
    `
  })
}
