// controllers/analyticsController.js
import LinkClick from '../models/LinkClick.js'
import ProfileVisit from '../models/ProfileVisit.js'
import mongoose from 'mongoose'

/* ==================================================
 📊 CLIQUES POR DIA (últimos 30 dias)
================================================== */
export const getClicksByDay = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)

    const data = await LinkClick.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: {
            day: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { '_id.day': 1 } }
    ])

    res.json(data)
  } catch (err) {
    console.error('getClicksByDay error:', err)
    res.status(500).json({ error: 'Erro ao gerar analytics de cliques' })
  }
}

export const getDevicesStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)

    const data = await ProfileVisit.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $ifNull: ['$device', 'desktop']
          },
          total: { $sum: 1 }
        }
      }
    ])

    // normaliza saída
    const result = data.map(d => ({
      name:
        d._id === 'mobile'
          ? 'Mobile'
          : d._id === 'tablet'
          ? 'Tablet'
          : 'Desktop',
      value: d.total
    }))

    res.json(result)
  } catch (err) {
    console.error('getDevicesStats error:', err)
    res.status(500).json({ error: 'Erro ao gerar analytics de dispositivos' })
  }
}
