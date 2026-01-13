// services/adminService.js
import User from '../models/User.js'
import ProfileVisit from '../models/ProfileVisit.js'
import Link from '../models/Link.js'

/* 📊 OVERVIEW DO ADMIN (DADOS GLOBAIS DO SISTEMA) */
export async function getAdminOverview() {
  const [
    totalUsers,
    activeUsers,
    totalVisits,
    clicksAgg
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ blocked: false }),
    ProfileVisit.countDocuments(),
    Link.aggregate([
      {
        $group: {
          _id: null,
          clicks: { $sum: '$clicks' }
        }
      }
    ])
  ])

  return {
    users: totalUsers,
    activeUsers,
    visits: totalVisits,
    clicks: clicksAgg[0]?.clicks || 0
  }
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
      'name email username role blocked createdAt lastLogin isVerified'
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
