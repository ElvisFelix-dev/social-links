import express from 'express'
import {
  toggleLike,
  getLikeStatus,
  getLikeCount
} from '../controllers/likeController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/:linkId', authMiddleware, toggleLike)
router.get('/:linkId/status', authMiddleware, getLikeStatus)
router.get('/:linkId/count', getLikeCount)

export default router
