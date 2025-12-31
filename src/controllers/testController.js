import brevoClient from '../utils/brevoClient.js'

export const testBrevoEmail = async (req, res) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      return res.status(500).json({
        error: 'BREVO_API_KEY não definida'
      })
    }

    const result = await brevoClient.sendTransacEmail({
      sender: {
        name: 'LinksAll Test',
        email: 'sociallinkofi@gmail.com'
      },
      to: [
        {
          email: 'elvisjaspion@gmail.com',
          name: 'Elvis Felix'
        }
      ],
      subject: '✅ Teste Brevo - Email OK',
      htmlContent: `
        <div style="font-family: Arial; padding: 24px;">
          <h2>Teste de Email 🚀</h2>
          <p>Se você recebeu este email, o <strong>Brevo está funcionando</strong>.</p>
          <p>Ambiente: <strong>${process.env.NODE_ENV || 'local'}</strong></p>
        </div>
      `
    })

    return res.json({
      message: 'Email enviado com sucesso',
      brevoResponse: result
    })
  } catch (err) {
    console.error('❌ Erro no teste do Brevo:', err)

    return res.status(500).json({
      error: 'Falha ao enviar email',
      details: err?.response?.body || err.message
    })
  }
}
