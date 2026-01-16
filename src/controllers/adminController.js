import {
  getAdminOverview,
  getUsersPaginated,
  getUserDetails as getUserDetailsService,
  getUserAnalytics,
  updateUserRole,
  blockUser,
  getVisitsComparison,
  getTopUsersByVisits,
  getWeeklyHighlightUser
} from '../services/adminService.js'

/* 📊 ANALYTICS DE UM USUÁRIO */
export async function getUserAnalyticsController(req, res) {
  try {
    const { userId } = req.params

    const analytics = await getUserAnalytics(userId)

    return res.json(analytics)
  } catch (err) {
    console.error('ADMIN getUserAnalytics error', err)
    return res.status(500).json({ message: 'Erro interno' })
  }
}

export async function adminOverviewController(req, res) {
  try {
    const period = Number(req.query.period || 7)

    const [
      overview,
      visitsComparison,
      topUsers,
      highlightUser
    ] = await Promise.all([
      getAdminOverview(),
      getVisitsComparison(period),
      getTopUsersByVisits(period),
      getWeeklyHighlightUser()
    ])

    return res.json({
      stats: {
        users: {
          current: overview.users,
          diff: 0,
          trend: 'up'
        },
        activeUsers: {
          current: overview.activeUsers,
          diff: 0,
          trend: 'up'
        },
        visits: visitsComparison,
        clicks: {
          current: overview.clicks,
          diff: 0,
          trend: 'up'
        }
      },

      analytics: overview.analytics,
      topUsers,
      highlightUser
    })
  } catch (err) {
    console.error('ADMIN overview/all error', err)
    return res.status(500).json({ message: 'Erro interno' })
  }
}

/* 📋 LISTAR USUÁRIOS (PAGINADO + BUSCA) */
export async function listUsers(req, res) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const search = req.query.search || ''

    const data = await getUsersPaginated({ page, limit, search })

    return res.json(data)
  } catch (err) {
    console.error('ADMIN listUsers error', err)
    return res.status(500).json({ message: 'Erro interno' })
  }
}

/* 👤 DETALHE DE UM USUÁRIO */
export async function getUserDetailsController(req, res) {
  try {
    const { userId } = req.params

    const user = await getUserDetailsService(userId)

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    return res.json(user)
  } catch (err) {
    console.error('ADMIN getUserDetails error', err)
    return res.status(500).json({ message: 'Erro interno' })
  }
}

/* 🛡️ ATUALIZAR ROLE (user | admin) */
export async function updateRole(req, res) {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role inválida' })
    }

    const user = await updateUserRole(userId, role)

    return res.json({
      message: 'Role atualizada com sucesso',
      user
    })
  } catch (err) {
    console.error('ADMIN updateRole error', err)
    return res.status(500).json({ message: 'Erro interno' })
  }
}

/* 🚫 BLOQUEAR / DESBLOQUEAR USUÁRIO */
export async function toggleBlockUser(req, res) {
  try {
    const { userId } = req.params

    const user = await blockUser(userId)

    return res.json({
      message: user.blocked
        ? 'Usuário bloqueado'
        : 'Usuário desbloqueado',
      user
    })
  } catch (err) {
    console.error('ADMIN toggleBlockUser error', err)
    return res.status(500).json({ message: 'Erro interno' })
  }
}
