import express from 'express'
import {
  getOverview,
  getTopClickedLinks
} from '../controllers/analyticsLinksController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

/**
 * Overview geral
 */
router.get('/overview', getOverview)

/**
 * Top links
 */
router.get('/top-links', getTopClickedLinks)

export default router
