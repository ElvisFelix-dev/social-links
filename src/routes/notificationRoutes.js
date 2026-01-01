import express from 'express'
import Notification from '../models/Notification.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// 🔔 Buscar notificações não lidas
router.get('/unread', authMiddleware, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
    read: false
  })
    .populate('fromUser', 'name username avatar') // ✅ AQUI
    .sort({ createdAt: -1 })

  res.json(notifications)
})

// ✅ Marcar todas como lidas
router.patch('/read', authMiddleware, async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  )

  res.sendStatus(204)
})

export default router
