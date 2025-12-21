import { Router } from 'express'
import {
  createLink,
  getMyLinks,
  updateLink,
  deleteLink,
  reorderLinks,
  toggleLike
} from '../controllers/linkController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.use(authMiddleware)

// ⚠️ rotas específicas PRIMEIRO
router.put('/reorder/all', reorderLinks)
router.post('/:linkId/like', toggleLike)

// depois as genéricas
router.post('/', createLink)
router.get('/', getMyLinks)
router.put('/:id', updateLink)
router.delete('/:id', deleteLink)

export default router
