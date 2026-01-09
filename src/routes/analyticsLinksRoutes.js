import express from 'express'
import {
  getTopClickedLinks,
  getClicksOverview,
  getDailyStats,
  getVisitsByCountry,
  getVisitsByRegion,
  getVisitsByCity
} from '../controllers/analyticsLinksController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/analytics-links', getTopClickedLinks)
router.get('/clicks-overview', getClicksOverview)
router.get('/daily', getDailyStats)
router.get('/by-country',getVisitsByCountry )
router.get('/by-region',getVisitsByRegion )
router.get('/by-city',getVisitsByCity )

export default router
