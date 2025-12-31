import transactionalEmailApi from './src/utils/brevoClient.js'

async function testBrevo() {
  try {
    const response = await transactionalEmailApi.sendTransacEmail({
      sender: {
        email: 'seu-email-verificado@dominio.com',
        name: 'Teste Brevo'
      },
      to: [
        {
          email: 'seu-email@gmail.com',
          name: 'Elvis'
        }
      ],
      subject: 'Teste Brevo ✔️',
      htmlContent: '<h1>Email enviado com sucesso 🚀</h1>'
    })

    console.log('✅ Email enviado:', response)
  } catch (error) {
    console.error('❌ Erro ao enviar email')
    console.error(error?.response?.body || error)
  }
}

testBrevo()
