// controllers/publicProfileController.js
import User from '../models/User.js'
import Link from '../models/Link.js'
import { registerProfileVisit } from './profileAnalyticsController.js'
import { getTopCreator, getTopCreators } from '../services/adminService.js'

import { isTopCreator } from '../services/publicService.js'

export async function getTopCreatorBadge(req, res) {
  const { username } = req.params

  const isTop = await isTopCreator(username, 7)

  return res.json({ isTop })
}

export async function getTopCreatorController(req, res) {
  try {
    const topCreator = await getTopCreator(7)
    return res.json(topCreator)
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno' })
  }
}

export async function getTopCreatorsController(req, res) {
  const period = Number(req.query.period || 7)

  const creators = await getTopCreators(period)
  return res.json(creators)
}

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params

    // 🔎 Buscar usuário
    const user = await User.findOne({ username }).select(`
      name
      username
      avatar
      bio
      email
      profileBackground
      isVerified
      followers
      following
    `)

    if (!user) {
      return res.status(404).json({ error: 'Perfil não encontrado' })
    }

    /* ==================================================
       📊 REGISTRAR VISITA AO PERFIL
    ================================================== */
    const loggedUserId = req.user?._id

    if (!loggedUserId || loggedUserId.toString() !== user._id.toString()) {
      registerProfileVisit(req, user)
    }

    /* ==================================================
       🏆 VERIFICAR TOP 1 DA SEMANA (7 dias)
    ================================================== */
    let isTopWeek = false

    try {
      const topCreators = await getTopCreators(7)

      if (
        Array.isArray(topCreators) &&
        topCreators.length > 0 &&
        topCreators[0].userId?.toString() === user._id.toString()
      ) {
        isTopWeek = true
      }
    } catch (err) {
      console.error('Erro ao verificar Top da Semana:', err)
      // ❗ não quebra o perfil se ranking falhar
    }

    // 🔗 Buscar links ativos
    const links = await Link.find({
      user: user._id,
      isActive: true
    })
      .sort({ order: 1 })
      .select('title url icon clicks likes')

    return res.json({
      user: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        email: user.email,
        profileBackground: user.profileBackground,
        isVerified: user.isVerified,
        isTopWeek, // 🥇 BADGE DINÂMICO
        followersCount: user.followers.length,
        followingCount: user.following.length
      },
      links
    })
  } catch (error) {
    console.error('Erro ao buscar perfil público:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor'
    })
  }
}
