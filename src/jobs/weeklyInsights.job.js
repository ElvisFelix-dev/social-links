import cron from 'node-cron'
import User from '../models/User.js'
import { sendWeeklyInsightsEmail } from '../services/sendWeeklyInsightsEmail.js'

export function startWeeklyInsightsJob() {
  // Toda segunda às 08:00
  cron.schedule('0 8 * * 1', async () => {
    console.log('📨 Enviando insights semanais...')

    const users = await User.find({ emailVerified: true }).select('_id')

    for (const user of users) {
      try {
        await sendWeeklyInsightsEmail(user._id)
      } catch (err) {
        console.error(`Erro ao enviar email para ${user._id}`, err)
      }
    }
  })
}
