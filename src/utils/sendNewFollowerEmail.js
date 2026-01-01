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
      <div style="font-family: Arial; padding: 24px;">
        <h2>Olá, ${toName} 👋</h2>

        <p>Você ganhou um novo seguidor no <strong>LinksAll</strong> 🎉</p>

        <div style="display:flex; gap:12px; margin:16px 0;">
          ${
            followerAvatar
              ? `<img src="${followerAvatar}" width="56" height="56" style="border-radius:50%;" />`
              : ''
          }
          <div>
            <strong>${followerName}</strong><br/>
            <span>@${followerUsername}</span>
          </div>
        </div>

        <a
          href="https://linksalll.netlify.app/${followerUsername}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#22c55e;
            color:#fff;
            border-radius:6px;
            text-decoration:none;
          "
        >
          Ver perfil
        </a>

        <p style="margin-top:24px; font-size:12px; color:#666;">
          © 2025 LinksAll
        </p>
      </div>
    `
  })
}
