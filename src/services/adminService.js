import { Types } from 'mongoose'
import User from '../models/User.js'
import ProfileVisit from '../models/ProfileVisit.js'
import Link from '../models/Link.js'

function calcDiff(current, previous) {
  if (previous === 0) {
    return { diff: 100, trend: 'up' }
  }

  const diff = ((current - previous) / previous) * 100

  return {
    diff: Math.round(diff),
    trend: diff >= 0 ? 'up' : 'down'
  }
}

export async function getVisitsComparison(days = 7) {
  const now = new Date()
  const startCurrent = new Date()
  startCurrent.setDate(now.getDate() - days)

  const startPrevious = new Date()
  startPrevious.setDate(now.getDate() - days * 2)

  const [current, previous] = await Promise.all([
    ProfileVisit.countDocuments({
      createdAt: { $gte: startCurrent }
    }),
    ProfileVisit.countDocuments({
      createdAt: {
        $gte: startPrevious,
        $lt: startCurrent
      }
    })
  ])

  const { diff, trend } = calcDiff(current, previous)

  return {
    current,
    previous,
    diff,
    trend
  }
}

export async function getAdminOverview() {
  const [
    totalUsers,
    activeUsers,
    totalVisits,
    clicksAgg,

    countries,
    region,
    cities,
    devices,
    os,
    browsers
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ blocked: false }),
    ProfileVisit.countDocuments(),

    Link.aggregate([
      { $group: { _id: null, clicks: { $sum: '$clicks' } } }
    ]),

    aggregateVisits('country'),
    aggregateVisits('region'),
    aggregateVisits('city'),
    aggregateVisits('device'),
    aggregateVisits('os'),
    aggregateVisits('browser')
  ])

  return {
    users: totalUsers,
    activeUsers,
    visits: totalVisits,
    clicks: clicksAgg[0]?.clicks || 0,

    analytics: {
      countries,
      region,
      cities,
      devices,
      os,
      browsers
    }
  }
}

export async function getTopCreator(days = 7) {
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
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$user._id',
        name: '$user.name',
        avatar: '$user.avatar',
        visits: 1
      }
    }
  ])

  return result[0] || null
}

export async function getTopCreators(days = 7, limit = 10) {
  const start = new Date()
  start.setDate(start.getDate() - days)

  return ProfileVisit.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: '$userId',
        visits: { $sum: 1 }
      }
    },
    { $sort: { visits: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$user._id',
        name: '$user.name',
        avatar: '$user.avatar',
        visits: 1
      }
    }
  ])
}

export async function getTopUsersByVisits(days = 7, limit = 5) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return ProfileVisit.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$userId',
        visits: { $sum: 1 }
      }
    },
    { $sort: { visits: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$user._id',
        username: '$user.username',
        avatar: '$user.avatar',
        visits: 1
      }
    }
  ])
}

export async function getWeeklyHighlightUser() {
  const result = await getTopUsersByVisits(7, 1)
  return result[0] || null
}

export async function getUserAnalytics(userId) {
  const objectId = new Types.ObjectId(userId)

  const [
    visitsByDay,
    countries,
    region,
    cities,
    devices,
    os,
    browsers
  ] = await Promise.all([
    ProfileVisit.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    aggregateUserVisits(userId, 'country'),
    aggregateUserVisits(userId, 'state'),
    aggregateUserVisits(userId, 'city'),
    aggregateUserVisits(userId, 'device'),
    aggregateUserVisits(userId, 'os'),
    aggregateUserVisits(userId, 'browser')
  ])

  return {
    visitsByDay,
    locations: {
      countries,
      region,
      cities
    },
    devices,
    os,
    browsers
  }
}

async function aggregateUserVisits(userId, field) {
  return ProfileVisit.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        [field]: { $ne: null }
      }
    },
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        label: '$_id',
        count: 1
      }
    }
  ])
}

/* ♻️ Helper reutilizável */
async function aggregateVisits(field) {
  return ProfileVisit.aggregate([
    { $match: { [field]: { $ne: null } } },
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        label: '$_id',
        count: 1
      }
    }
  ])
}

/* 📋 LISTAGEM DE USUÁRIOS (PAGINADA + BUSCA) */
export async function getUsersPaginated({ page, limit, search }) {
  const skip = (page - 1) * limit

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ]
      }
    : {}

  const [users, total] = await Promise.all([
    User.find(query)
      .select(
        'avatar name email username role blocked createdAt lastLogin isVerified'
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(query)
  ])

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/* 👤 DETALHE DO USUÁRIO (COM MÉTRICAS) */
export async function getUserDetails(userId) {
  const user = await User.findById(userId)
    .select(
      'avatar name email username role blocked createdAt lastLogin isVerified followers'
    )
    .lean()

  if (!user) return null

  const [visits, links, clicksAgg] = await Promise.all([
    ProfileVisit.countDocuments({ userId }),
    Link.countDocuments({ user: userId }),
    Link.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          clicks: { $sum: '$clicks' }
        }
      }
    ])
  ])

  return {
    ...user,
    followersCount: user.followers?.length || 0,
    stats: {
      visits,
      links,
      clicks: clicksAgg[0]?.clicks || 0
    }
  }
}

/* 🛡️ ATUALIZAR ROLE (user | admin) */
export async function updateUserRole(userId, role) {
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select('name email username role blocked')

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  return user
}

/* 🚫 BLOQUEAR / DESBLOQUEAR USUÁRIO */
export async function blockUser(userId) {
  const user = await User.findById(userId)

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  user.blocked = !user.blocked
  await user.save()

  return user
}
