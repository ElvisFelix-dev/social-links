import Link from '../models/Link.js'
import Click from '../models/Click.js'

export const registerClick = async (req, res) => {
  try {
    const { id } = req.params

    const link = await Link.findById(id)

    if (!link || !link.isActive) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }

    // 🔢 incrementa contador
    link.clicks += 1
    await link.save()

    // 📊 salva analytics
    Click.create({
      link: link._id,
      user: link.user,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }).catch(() => {})

    // 🔁 redireciona
    return res.redirect(link.url)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao registrar clique' })
  }
}
