import { generateInsights } from '../services/insightsService.js'

export async function getInsights(req, res) {
  try {
    const data = await generateInsights(req.user._id)
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao gerar insights' })
  }
}
