// routes/analyticsRoutes.js
import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { getClicksByDay } from '../controllers/analyticsController.js'

const router = Router()

router.get('/clicks/daily', authMiddleware, getClicksByDay)

export default router
