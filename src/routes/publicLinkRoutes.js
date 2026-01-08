import { Router } from 'express'
import Link from '../models/Link.js'
import LinkClick from '../models/LinkClick.js'
import { parseAnalytics } from '../utils/analytics.js'

const router = Router()

router.get('/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params
    const link = await Link.findById(linkId)
    if (!link) return res.status(404).json({ error: 'Link não encontrado' })

    // 📊 Registrar clique
    const analytics = parseAnalytics(req)
    await LinkClick.create({
      linkId,
      profileId: link.user,
      ...analytics
    })

    // 🔗 Redirecionar usuário
    return res.redirect(link.url)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao acessar link' })
  }
})

export default router
