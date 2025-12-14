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
router.get('/l/:id', registerClick)

export default router
