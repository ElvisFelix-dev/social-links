import { Router } from 'express'
import {
  getPublicProfile,
  getTopCreatorsController,
  getTopCreatorBadge
} from '../controllers/publicProfileController.js'
import { registerClick } from '../controllers/clickController.js'

const router = Router()

router.get('/public/:username', getPublicProfile)
router.get('/l/:id', registerClick)
router.get('/top-creators', getTopCreatorsController)
// routes/publicRoutes.js
router.get('/badge/top-week/:username', getTopCreatorBadge)


export default router
