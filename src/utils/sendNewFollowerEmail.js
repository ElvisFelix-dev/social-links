// utils/sendNewFollowerEmail.js
import brevoClient from './brevoClient.js'

export const sendNewFollowerEmail = async ({
  toEmail,
  toName,
  followerName,
  followerUsername,
  followerAvatar
}) => {
  return brevoClient.sendTransacEmail({
    sender: {
      name: 'LinksAll',
      email: 'sociallinkofi@gmail.com'
    },
    to: [
      {
        email: toEmail,
        name: toName
      }
    ],
    subject: '🎉 Você tem um novo seguidor no LinksAll',
    htmlContent: `
      <div style="
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f4f6f8;
        padding: 24px;
      ">
        <div style="
          max-width: 520px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 10px;
          padding: 24px;
        ">
          <h2 style="margin: 0 0 12px; color: #111827;">
            Olá, ${toName} 👋
          </h2>

          <p style="color: #374151; font-size: 15px; margin-bottom: 20px;">
            Você ganhou um novo seguidor no <strong>LinksAll</strong> 🎉
          </p>

          <div style="
            display: flex;
            align-items: center;
            gap: 14px;
            background: #f9fafb;
            padding: 14px;
            border-radius: 8px;
            margin-bottom: 24px;
          ">
            ${
              followerAvatar
                ? `
                  <img
                    src="${followerAvatar}"
                    alt="${followerName}"
                    width="56"
                    height="56"
                    style="border-radius: 50%; object-fit: cover;"
                  />
                `
                : `
                  <div style="
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #6b7280;
                  ">
                    ${followerName?.charAt(0).toUpperCase() || '?'}
                  </div>
                `
            }

            <div>
              <strong style="display: block; color: #111827;">
                ${followerName}
              </strong>
              <span style="color: #6b7280; font-size: 14px;">
                @${followerUsername}
              </span>
            </div>
          </div>

          <a
            href="https://linksalll.netlify.app/${followerUsername}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #22c55e;
              color: #ffffff;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
            "
          >
            Ver perfil
          </a>

          <p style="
            margin-top: 28px;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
          ">
            © ${new Date().getFullYear()} LinksAll — Todos os direitos reservados
          </p>
        </div>
      </div>
    `
  })
}
