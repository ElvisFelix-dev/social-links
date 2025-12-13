import Click from '../models/Click.js'
import mongoose from 'mongoose'

export const getClicksByDay = async (req, res) => {
  try {
    const userId = req.user.id

    const stats = await Click.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' },
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ])

    return res.json(stats)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao gerar analytics' })
  }
}
