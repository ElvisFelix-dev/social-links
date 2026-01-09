import express from 'express'
import { getInsights } from '../controllers/analyticsInsightsController.js'

import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/insights', getInsights)

export default router
