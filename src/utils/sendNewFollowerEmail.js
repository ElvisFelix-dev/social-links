import brevo from './brevoClient.js'

export const sendNewFollowerEmail = async ({
  toEmail,
  toName,
  followerName,
  followerUsername,
  followerAvatar
}) => {
  const profileUrl = `${process.env.FRONTEND_URL}/${followerUsername}`

  await brevo.sendTransacEmail({
    sender: {
      name: 'LinksAll',
      email: 'sociallinkofi@gmail.com'
    },
    to: [{ email: toEmail, name: toName }],
    subject: '🎉 Você tem um novo seguidor no LinksAll',
    htmlContent: `
      <div style="font-family: Arial; padding: 24px;">
        <h2>Olá, ${toName} 👋</h2>

        <p>Você ganhou um novo seguidor no <strong>LinksAll</strong> 🎉</p>

        <div style="display:flex; align-items:center; gap:12px; margin:16px 0;">
          <img
            src="${followerAvatar || `https://ui-avatars.com/api/?name=${followerName}`}"
            width="56"
            height="56"
            style="border-radius:50%;"
          />
          <div>
            <strong>${followerName}</strong><br/>
            <span>@${followerUsername}</span>
          </div>
        </div>

        <a
          href="${profileUrl}"
          style="
            display: inline-block;
            margin-top: 16px;
            padding: 12px 20px;
            background: #22c55e;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Ver perfil
        </a>

        <p style="margin-top: 24px; font-size: 12px; color: #666;">
          © ${new Date().getFullYear()} LinksAll
        </p>
      </div>
    `
  })
}
