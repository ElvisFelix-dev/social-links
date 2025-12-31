import express from 'express'
import { testBrevoEmail } from '../controllers/testController.js'

const router = express.Router()

router.get('/brevo', testBrevoEmail)

export default router
