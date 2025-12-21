import { Router } from 'express'
import passport from 'passport'
import { googleLogin, getCurrentUser, updateProfile } from '../controllers/userController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

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

router.get('/me', authMiddleware, getCurrentUser)

router.put('/profile', authMiddleware, updateProfile)

export default router
