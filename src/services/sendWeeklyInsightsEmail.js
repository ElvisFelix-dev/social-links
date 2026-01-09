import brevo from '../utils/brevoClient.js'
import { weeklyInsightsEmail } from '../utils/weeklyInsightsEmail.js'
import { generateInsights } from './insightsService.js'
import User from '../models/User.js'

export async function sendWeeklyInsightsEmail(userId) {
  const user = await User.findById(userId).select('name email')

  if (!user?.email) return

  const insightsData = await generateInsights(userId)

  await brevo.sendTransacEmail({
    sender: {
      name: 'LinksAll',
      email: 'sociallinkofi@gmail.com'
    },
    to: [{ email: user.email, name: user.name }],
    subject: '📊 Seu resumo semanal de performance',
    htmlContent: weeklyInsightsEmail({
      userName: user.name || '👋',
      summary: insightsData.summary,
      regions: insightsData.regions,
      insights: insightsData.insights,
      score: insightsData.score
    })
  })
}
