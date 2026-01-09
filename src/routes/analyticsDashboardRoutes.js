import { Router } from 'express'
import {
  getOverview,
  getDailyStats,
  getTopLinks
} from '../controllers/analyticsDashboardController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.get('/overview', authMiddleware, getOverview)
router.get('/daily', authMiddleware, getDailyStats)
router.get('/top', authMiddleware, getTopLinks)

export default router
