import { Router } from 'express'
import authMiddleware, { authAdmin } from '../middleware/authMiddleware.js'
import {
  getOverview,
  listUsers,
  getUserDetailsController,
  updateRole,
  toggleBlockUser,
  getUserAnalyticsController,
  adminOverviewController
} from '../controllers/adminController.js'

const router = Router()

router.use(authMiddleware, authAdmin)

/* 📊 DASHBOARD ADMIN (overview premium) */
router.get('/overview',  getOverview)

router.get('/overview/all', adminOverviewController)

/* 👥 Usuários */
router.get('/users', listUsers)
router.get('/users/:userId', getUserDetailsController)
// routes/adminRoutes.js
router.get('/users/:userId/analytics', getUserAnalyticsController)
router.patch('/users/:userId/role', updateRole)
router.patch('/users/:userId/block', toggleBlockUser)

export default router
