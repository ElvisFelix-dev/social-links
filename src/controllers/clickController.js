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

    // 📊 salva analytics (não bloqueante)
    Click.create({
      link: link._id,
      user: link.user,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }).catch(() => {})

    // ✅ GARANTIR URL VÁLIDA
    let redirectUrl = link.url

    if (
      !redirectUrl.startsWith('http://') &&
      !redirectUrl.startsWith('https://')
    ) {
      redirectUrl = `https://${redirectUrl}`
    }

    // 🔁 redireciona corretamente
    return res.redirect(redirectUrl)

  } catch (error) {
    console.error('Erro ao registrar clique:', error)
    return res.status(500).json({ error: 'Erro ao registrar clique' })
  }
}
