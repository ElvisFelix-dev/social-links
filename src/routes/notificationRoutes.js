import express from 'express'
import Notification from '../models/Notification.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

/* ==================================================
 🔔 TODAS AS NOTIFICAÇÕES (HISTÓRICO)
================================================== */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id
    })
      .populate('fromUser', 'name username avatar')
      .sort({ createdAt: -1 })

    // 🧹 Remove notificações órfãs (fromUser deletado)
    const validNotifications = notifications.filter(
      n => n.fromUser
    )

    res.json(validNotifications)
  } catch (err) {
    console.error('Erro ao buscar notificações:', err)
    res.status(500).json({ message: 'Erro ao buscar notificações' })
  }
})

/* ==================================================
 🔔 NOTIFICAÇÕES NÃO LIDAS
================================================== */
router.get('/unread', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
      read: false
    })
      .populate('fromUser', 'name username avatar')
      .sort({ createdAt: -1 })

    const validNotifications = notifications.filter(
      n => n.fromUser
    )

    res.json(validNotifications)
  } catch (err) {
    console.error('Erro ao buscar notificações não lidas:', err)
    res.status(500).json({ message: 'Erro ao buscar notificações' })
  }
})

/* ==================================================
 ✅ MARCAR TODAS COMO LIDAS
================================================== */
router.patch('/read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        read: false
      },
      {
        $set: { read: true }
      }
    )

    res.sendStatus(204)
  } catch (err) {
    console.error('Erro ao marcar notificações como lidas:', err)
    res.status(500).json({ message: 'Erro ao atualizar notificações' })
  }
})

export default router
