import express from 'express'
import { getTopClickedLinks, getClicksOverview } from '../controllers/analyticsLinksController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/analytics-links', getTopClickedLinks)
router.get('/clicks-overview', getClicksOverview)

export default router
