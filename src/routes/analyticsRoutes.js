// routes/analyticsRoutes.js
import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { getClicksByDay, getDevicesStats } from '../controllers/analyticsController.js'

const router = Router()

router.get('/clicks/daily', authMiddleware, getClicksByDay)
router.get('/devices', authMiddleware, getDevicesStats)

export default router
