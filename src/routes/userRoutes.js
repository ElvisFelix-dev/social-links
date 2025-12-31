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
  getFollowing,
  getUserByUsername,
  getSuggestedUsers,
  exploreUsers,
  searchUsers,
  getUserSuggestions,
  getSuggestionsByCategory,
  getUsersByCategory
} from '../controllers/userController.js'

import uploadBackground from '../middleware/uploadBackground.js'
import  authMiddleware  from '../middleware/authMiddleware.js'
import optionalAuthMiddleware from '../middleware/optionalAuthMiddleware.js'

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

// 🔍 EXPLORE (com search e category via query params)
router.get(
  '/explore',
  optionalAuthMiddleware,
  exploreUsers
)

router.get('/suggestions', getSuggestedUsers)
router.get('/suggestions-users', getUserSuggestions)
router.get('/suggestions-by-category', getSuggestionsByCategory)
// Lista usuários por categoria
router.get('/:category', getUsersByCategory);
router.get('/search', searchUsers)

// 📌 LISTAS (SEM AUTH)
router.get('/profile/:username/followers', getFollowers)
router.get('/profile/:username/following', getFollowing)

router.get(
  '/:username',
  optionalAuthMiddleware, // Opcional: caso queira saber se o user logado é o dono do perfil no futuro
  getUserByUsername
)

// 🔍 Status de follow (perfil público)
router.get(
  '/:username/follow-status',
  optionalAuthMiddleware,
  getFollowStatus
)

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
