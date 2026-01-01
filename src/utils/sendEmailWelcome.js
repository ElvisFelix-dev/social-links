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
      <div style="
        background: linear-gradient(135deg, #0f172a, #020617);
        padding: 40px 20px;
        font-family: Arial, Helvetica, sans-serif;
      ">
        <div style="
          max-width: 520px;
          margin: 0 auto;
          background: #020617;
          border-radius: 16px;
          padding: 32px;
          color: #ffffff;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        ">

          <!-- LOGO / TITLE -->
          <h1 style="
            margin: 0 0 8px;
            font-size: 26px;
            font-weight: 700;
            text-align: center;
            letter-spacing: -0.5px;
          ">
            🔗 LinksAll
          </h1>

          <p style="
            text-align: center;
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 32px;
          ">
            Sua presença online em um só lugar
          </p>

          <!-- CONTENT -->
          <h2 style="
            font-size: 20px;
            margin-bottom: 12px;
            font-weight: 600;
          ">
            Olá, ${name}! 👋
          </h2>

          <p style="
            font-size: 15px;
            line-height: 1.6;
            color: #e5e7eb;
            margin-bottom: 16px;
          ">
            Seja muito bem-vindo ao <strong>LinksAll</strong>!
            Agora você pode centralizar seus links, compartilhar
            seu perfil com facilidade e fortalecer sua presença digital.
          </p>

          <p style="
            font-size: 15px;
            line-height: 1.6;
            color: #e5e7eb;
            margin-bottom: 28px;
          ">
            Crie seu perfil, personalize seus links
            e comece a crescer sua audiência 🚀
          </p>

          <!-- CTA -->
          <div style="text-align: center;">
            <a
              href="${process.env.FRONTEND_URL}"
              style="
                display: inline-block;
                padding: 14px 28px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: #ffffff;
                text-decoration: none;
                border-radius: 999px;
                font-size: 15px;
                font-weight: 600;
                box-shadow: 0 6px 20px rgba(34,197,94,0.35);
              "
            >
              Acessar minha conta
            </a>
          </div>

          <!-- FOOTER -->
          <hr style="
            border: none;
            border-top: 1px solid #1f2933;
            margin: 32px 0 20px;
          " />

          <p style="
            font-size: 12px;
            color: #64748b;
            text-align: center;
            line-height: 1.5;
          ">
            © ${new Date().getFullYear()} LinksAll<br />
            Todos os direitos reservados.
          </p>

        </div>
      </div>
    `
  })
}
