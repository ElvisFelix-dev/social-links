import sendEmail from './sendEmail.js'

export const sendWelcomeEmail = async ({ name, email }) => {
  const message = `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f4f4f5;
      padding: 40px 20px;
    ">
      <div style="
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        padding: 32px;
        color: #18181b;
      ">
        <h2 style="margin-top: 0;">Olá, ${name} 👋</h2>

        <p>Seja muito bem-vindo ao <strong>LinksAll</strong>!</p>

        <p>
          Agora você pode centralizar todos os seus links em um único lugar,
          personalizar seu perfil e compartilhar com facilidade.
        </p>

        <div style="margin: 32px 0; text-align: center;">
          <a
            href="${process.env.FRONTEND_URL}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            "
          >
            Acessar minha conta
          </a>
        </div>

        <p style="font-size: 14px; color: #52525b;">
          Se tiver qualquer dúvida, é só responder este e-mail.
        </p>

        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />

        <p style="font-size: 14px; color: #71717a;">
          Atenciosamente,<br />
          <strong>Equipe LinksAll</strong>
        </p>
      </div>

      <p style="
        text-align: center;
        font-size: 12px;
        color: #a1a1aa;
        margin-top: 20px;
      ">
        © ${new Date().getFullYear()} LinksAll. Todos os direitos reservados.
      </p>
    </div>
  `

  await sendEmail({
    email,
    subject: 'Bem-vindo ao LinksAll 🚀',
    message
  })
}
