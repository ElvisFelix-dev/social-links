import { Router } from 'express'
import { getPublicProfile } from '../controllers/publicProfileController.js'
import { registerClick } from '../controllers/clickController.js'

const router = Router()

router.get('/public/:username', getPublicProfile)
router.get('/l/:id', registerClick)

export default router
