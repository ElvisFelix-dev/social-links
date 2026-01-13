import { Router } from 'express'
import authMiddleware, { authAdmin } from '../middleware/authMiddleware.js'
import {
  getOverview,
  listUsers,
  getUserDetailsController,
  updateRole,
  toggleBlockUser
} from '../controllers/adminController.js'

const router = Router()

router.use(authMiddleware, authAdmin)

/* 📊 Dashboard */
router.get('/overview', getOverview)

/* 👥 Usuários */
router.get('/users', listUsers)
router.get('/users/:userId', getUserDetailsController)
router.patch('/users/:userId/role', updateRole)
router.patch('/users/:userId/block', toggleBlockUser)

export default router
