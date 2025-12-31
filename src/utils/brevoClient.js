// utils/brevoClient.js
import Brevo from '@getbrevo/brevo'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY não definida')
}

const transactionalEmailApi = new Brevo.TransactionalEmailsApi()

transactionalEmailApi.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
)

export default transactionalEmailApi
