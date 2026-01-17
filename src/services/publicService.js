// services/publicService.js
import ProfileVisit from '../models/ProfileVisit.js'
import User from '../models/User.js'

export async function isTopCreator(username, days = 7) {
  const start = new Date()
  start.setDate(start.getDate() - days)

  const result = await ProfileVisit.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: '$userId',
        visits: { $sum: 1 }
      }
    },
    { $sort: { visits: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  ])

  if (!result.length) return false

  return result[0].user.username === username
}
