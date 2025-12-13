import { Router } from 'express'
import passport from 'passport'
import { googleLogin } from '../controllers/userController.js'

const router = Router()

// 🔐 Inicia login com Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

// 🔁 Callback do Google
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleLogin
)

export default router
