import brevo from './brevoClient.js'

export const sendWelcomeEmail = async ({ name, email }) => {
  await brevo.sendTransacEmail({
    sender: {
      name: 'LinksAll',
      email: 'sociallinkofi@gmail.com'
    },
    to: [{ email, name }],
    subject: 'Bem-vindo ao LinksAll 🚀',
    htmlContent: `
      <div style="font-family: Arial; padding: 24px;">
        <h2>Olá, ${name} 👋</h2>

        <p>
          Seja muito bem-vindo ao <strong>LinksAll</strong>!
        </p>

        <p>
          Centralize seus links, compartilhe seu perfil
          e cresça sua audiência 🚀
        </p>

        <a
          href="${process.env.FRONTEND_URL}"
          style="
            display: inline-block;
            margin-top: 16px;
            padding: 12px 20px;
            background: #2563eb;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Acessar minha conta
        </a>

        <p style="margin-top: 24px; font-size: 12px; color: #666;">
          © ${new Date().getFullYear()} LinksAll
        </p>
      </div>
    `
  })
}
