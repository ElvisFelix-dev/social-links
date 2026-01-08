import Link from '../models/Link.js'
import LinkClick from '../models/LinkClick.js'
import { parseAnalytics } from '../utils/analytics.js'

export const handleLinkClick = async (req, res) => {
  try {
    const { id } = req.params

    const link = await Link.findOne({
      _id: id,
      isActive: true
    })

    if (!link) {
      return res.status(404).send('Link indisponível')
    }

    // 📈 incrementa contador
    link.clicks += 1
    await link.save()

    // 📊 analytics
    const analytics = parseAnalytics(req)

    await LinkClick.create({
      linkId: link._id,
      profileId: link.user,
      userId: link.user,
      ...analytics
    })

    // 🔀 redireciona
    return res.redirect(link.url)
  } catch (err) {
    console.error('Erro no click:', err)
    return res.status(500).send('Erro interno')
  }
}
