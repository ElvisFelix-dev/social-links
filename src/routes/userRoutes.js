import { Router } from 'express'
import { googleLogin } from '../controllers/userController.js'

const router = Router()

router.post('/google', googleLogin)

export default router
