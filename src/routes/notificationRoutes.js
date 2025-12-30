import express from 'express'
import Notification from '../models/Notification.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/unread', authMiddleware, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id, // 👈 atenção aqui
    read: false
  })
    .populate('fromUser', 'username avatar')
    .sort({ createdAt: -1 })

  res.json(notifications)
})

router.patch('/read', authMiddleware, async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  )

  res.sendStatus(204)
})

export default router
