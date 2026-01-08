import ProfileVisit from '../models/ProfileVisit.js'
import LinkClick from '../models/LinkClick.js'
import mongoose from 'mongoose'

export const getOverview = async (req, res) => {
  const userId = req.user.id

  const [visits, clicks] = await Promise.all([
    ProfileVisit.countDocuments({ userId }),
    LinkClick.countDocuments({ userId })
  ])

  res.json({ visits, clicks })
}

export const getTopLinks = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id)

    const topLinks = await LinkClick.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: '$linkId',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'links',
          localField: '_id',
          foreignField: '_id',
          as: 'link'
        }
      },
      { $unwind: '$link' },
      {
        $project: {
          linkId: '$_id',
          clicks: 1,
          title: '$link.title',
          url: '$link.url'
        }
      }
    ])

    res.json(topLinks)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar top links' })
  }
}

export const getDailyStats = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const data = await ProfileVisit.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        visits: { $sum: 1 }
      }
    },
    { $sort: { '_id.day': 1 } }
  ])

  res.json(data)
}

