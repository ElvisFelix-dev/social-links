import { Router } from 'express'
import { getClicksByDay } from '../controllers/analyticsController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/clicks/day', authMiddleware, getClicksByDay)

export default router
