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

router.post('/', createLink)
router.get('/', getMyLinks)
router.put('/:id', updateLink)
router.delete('/:id', deleteLink)
router.put('/reorder/all', reorderLinks)
router.post('/:linkId/like', authMiddleware, toggleLike)

export default router
