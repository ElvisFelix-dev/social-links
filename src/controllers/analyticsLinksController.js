import mongoose from 'mongoose'
import ProfileVisit from '../models/ProfileVisit.js'
import Link from '../models/Link.js'

export const getTopClickedLinks = async (req, res) => {
  try {
    const userId = req.user._id

    const links = await Link.find({ user: userId })
      .sort({ clicks: -1 })
      .limit(10)
      .select('title url clicks')

    res.json(
      links.map(link => ({
        linkId: link._id,
        title: link.title,
        url: link.url,
        clicks: link.clicks
      }))
    )
  } catch (error) {
    console.error('Erro ao buscar cliques dos links:', error)
    res.status(500).json({ error: 'Erro ao buscar cliques dos links' })
  }
}

export const getClicksOverview = async (req, res) => {
  try {
    const userId = req.user._id

    const result = await Link.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          clicks: { $sum: '$clicks' }
        }
      }
    ])

    res.json({
      clicks: result[0]?.clicks || 0
    })
  } catch (error) {
    console.error('Erro ao buscar total de cliques:', error)
    res.status(500).json({ error: 'Erro ao buscar total de cliques' })
  }
}

export const getDailyStats = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const data = await ProfileVisit.aggregate([
    { $match: { userId } },
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
        visits: { $sum: 1 }
      }
    },
    { $sort: { '_id.day': 1 } }
  ])

  res.json(data)
}

export async function getVisitsByCountry(req, res) {
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const data = await ProfileVisit.aggregate([
    { $match: { userId, country: { $ne: null } } },
    {
      $group: {
        _id: '$country',
        visits: { $sum: 1 }
      }
    },
    { $sort: { visits: -1 } }
  ])

  res.json(data)
}

export async function getVisitsByRegion(req, res) {
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const data = await ProfileVisit.aggregate([
    {
      $match: {
        userId,
        country: 'BR',
        region: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$region',
        visits: { $sum: 1 }
      }
    },
    { $sort: { visits: -1 } }
  ])

  res.json(data)
}

export async function getVisitsByCity(req, res) {
  const userId = new mongoose.Types.ObjectId(req.user.id)
  const { state } = req.query

  const match = {
    userId,
    city: { $ne: null }
  }

  if (state) {
    match.region = state
  }

  const data = await ProfileVisit.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$city',
        visits: { $sum: 1 }
      }
    },
    { $sort: { visits: -1 } },
    { $limit: 10 }
  ])

  res.json(data)
}


