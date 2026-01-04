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
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const data = await LinkClick.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$linkId',
        clicks: { $sum: 1 }
      }
    },
    { $sort: { clicks: -1 } },
    { $limit: 5 }
  ])

  res.json(data)
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

