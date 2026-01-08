import { Router } from 'express'
import { redirectLink } from '../controllers/linkRedirectController.js'

const router = Router()

router.get('/l/:id', redirectLink)

export default router
