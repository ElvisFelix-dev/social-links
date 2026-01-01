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
          box-shadow: 0 10px 40px rgba(0,0,0,0.45);
        ">

          <!-- HEADER -->
          <h1 style="
            margin: 0 0 6px;
            font-size: 24px;
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
            margin-bottom: 28px;
          ">
            Novo seguidor no seu perfil
          </p>

          <!-- GREETING -->
          <h2 style="
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
          ">
            Olá, ${toName}! 👋
          </h2>

          <p style="
            font-size: 15px;
            line-height: 1.6;
            color: #e5e7eb;
            margin-bottom: 24px;
          ">
            Você acabou de ganhar um novo seguidor no
            <strong>LinksAll</strong> 🎉
          </p>

          <!-- FOLLOWER CARD -->
          <div style="
            display: flex;
            align-items: center;
            gap: 14px;
            background: #020617;
            border: 1px solid #1f2937;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 28px;
          ">
            ${
              followerAvatar
                ? `
                  <img
                    src="${followerAvatar}"
                    width="56"
                    height="56"
                    style="
                      border-radius: 50%;
                      object-fit: cover;
                      border: 2px solid #22c55e;
                    "
                  />
                `
                : `
                  <div style="
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: #16a34a;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 700;
                  ">
                    ${followerName.charAt(0)}
                  </div>
                `
            }

            <div>
              <p style="
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                color: #ffffff;
              ">
                ${followerName}
              </p>
              <p style="
                margin: 2px 0 0;
                font-size: 13px;
                color: #94a3b8;
              ">
                @${followerUsername}
              </p>
            </div>
          </div>

          <!-- CTA -->
