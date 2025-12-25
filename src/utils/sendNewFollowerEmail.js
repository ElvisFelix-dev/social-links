import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendNewFollowerEmail = async ({
  toEmail,
  toName,
  followerName,
  followerUsername,
  followerAvatar
}) => {
  const profileUrl = `${process.env.FRONTEND_URL}/${followerUsername}`

  return resend.emails.send({
    from: 'LinksAll <onboarding@resend.dev>', // domínio verificado
    to: toEmail,
    subject: '🎉 Você tem um novo seguidor no LinksAll',
    html: `
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
          <h2>Olá, ${toName} 👋</h2>

          <p>
            Você ganhou um novo seguidor no <strong>LinksAll</strong>!
          </p>

          <div style="
            display: flex;
            align-items: center;
            gap: 16px;
            margin: 24px 0;
          ">
            <img
              src="${followerAvatar || 'https://ui-avatars.com/api/?name=' + followerName}"
              alt="${followerName}"
              width="64"
              height="64"
              style="
                border-radius: 50%;
                object-fit: cover;
              "
            />

            <div>
              <p style="margin: 0; font-weight: bold;">
                ${followerName}
              </p>
              <p style="margin: 4px 0; color: #52525b;">
                @${followerUsername}
              </p>
            </div>
          </div>

          <div style="margin: 32px 0; text-align: center;">
            <a
              href="${profileUrl}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #22c55e;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              "
            >
              Ver perfil
            </a>
          </div>

          <p style="font-size: 14px; color: #52525b;">
            Continue compartilhando seu perfil para conquistar ainda mais seguidores 🚀
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
  })
}
