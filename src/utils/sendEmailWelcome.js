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
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; font-family:Arial, Helvetica, sans-serif;">

              <!-- HEADER -->
              <tr>
                <td style="padding:32px; text-align:center; background:#111827;">
                  <h1 style="margin:0; font-size:22px; color:#ffffff;">
                    LinksAll
                  </h1>
                </td>
              </tr>

              <!-- CONTENT -->
              <tr>
                <td style="padding:32px;">
                  <h2 style="margin:0 0 16px; font-size:20px; color:#111827;">
                    Olá, ${name} 👋
                  </h2>

                  <p style="margin:0 0 16px; font-size:15px; color:#374151; line-height:1.6;">
                    Seja muito bem-vindo ao <strong>LinksAll</strong>!
                  </p>

                  <p style="margin:0 0 24px; font-size:15px; color:#374151; line-height:1.6;">
                    Aqui você pode centralizar seus links, compartilhar seu perfil
                    e fortalecer sua presença online de forma simples e profissional.
                  </p>

                  <!-- CTA -->
                  <div style="text-align:center; margin:32px 0;">
                    <a
                      href="${process.env.FRONTEND_URL}"
                      style="
                        display:inline-block;
                        padding:14px 28px;
                        background:#22c55e;
                        color:#ffffff;
                        text-decoration:none;
                        font-size:15px;
                        font-weight:bold;
                        border-radius:8px;
                      "
                    >
                      Acessar minha conta
                    </a>
                  </div>

                  <p style="margin:0; font-size:14px; color:#6b7280; line-height:1.6;">
                    Se tiver qualquer dúvida, é só responder este e-mail.
                    Estamos felizes em ter você com a gente 🚀
                  </p>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="padding:24px; text-align:center; background:#f9fafb;">
                  <p style="margin:0; font-size:12px; color:#9ca3af;">
                    © ${new Date().getFullYear()} LinksAll • Todos os direitos reservados
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `
  })
}
