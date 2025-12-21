import { Router } from 'express'
import passport from 'passport'
import {
  googleLogin,
  getCurrentUser,
  updateProfile,
  toggleFollow,
  updateProfileTheme
} from '../controllers/userController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import uploadBackground from '../middleware/uploadBackground.js'

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

router.post('/:userId/follow', authMiddleware, toggleFollow)

router.put(
  '/profile-theme',
  authMiddleware,
  uploadBackground.single('background'),
  updateProfileTheme
)

export default router
