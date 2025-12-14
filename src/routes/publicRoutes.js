// routes/publicRoutes.js
import { Router } from 'express'
import { getPublicProfile } from '../controllers/publicProfileController.js'
import { registerClick } from '../controllers/clickController.js'

const router = Router()

/**
 * 🌐 Perfil público
 * Ex: /api/public/elvisjaspion
 */
router.get('/public/:username', getPublicProfile)

/**
 * 🔗 Redirecionamento + contador de cliques
 * Ex: /api/l/64f1a9...
 */
// routes/publicRoutes.js
router.get('/l/:id', async (req, res) => {
  try {
    const link = await Link.findById(req.params.id)

    if (!link || !link.isActive) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }

    // registra clique
    link.clicks += 1
    await link.save()

    // redireciona
    return res.redirect(link.url)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao registrar clique' })
  }
})

export default router
