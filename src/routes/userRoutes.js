import { Router } from 'express'
import passport from 'passport'

import {
  googleLogin,
  getCurrentUser,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing
} from '../controllers/userController.js'

import uploadBackground from '../middleware/uploadBackground.js'
import  authMiddleware  from '../middleware/authMiddleware.js'

const router = Router()

/* ================= AUTH GOOGLE ================= */

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

/* ================= USUÁRIO LOGADO ================= */

// 👤 Dados do usuário autenticado
router.get('/me', authMiddleware, getCurrentUser)

// ✏️ Atualizar perfil (username, bio, background)
router.put(
  '/profile',
  authMiddleware,
  uploadBackground.single('profileBackground'),
  updateProfile
)

/* ================= SOCIAL ================= */

// 🔍 Status de follow (perfil público)
router.get(
  '/:username/follow-status',
  authMiddleware,
  getFollowStatus
)

router.get('/:username/followers', getFollowers)
router.get('/:username/following', getFollowing)

// ➕ Follow
router.post(
  '/:username/follow',
  authMiddleware,
  followUser
)

// ➖ Unfollow
router.delete(
  '/:username/unfollow',
  authMiddleware,
  unfollowUser
)

export default router
