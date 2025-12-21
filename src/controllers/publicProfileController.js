// controllers/publicProfileController.js
import User from '../models/User.js'
import Link from '../models/Link.js'
import jwt from 'jsonwebtoken'

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params

    // 🔎 Usuário visitante (opcional)
    let loggedUserId = null
    const authHeader = req.headers.authorization

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        loggedUserId = decoded.id
      } catch {
        loggedUserId = null
      }
    }

    // 👤 Buscar usuário do perfil
    const user = await User.findOne({ username }).select(
      'name username avatar bio followers following profileBackground'
    )

    if (!user) {
      return res.status(404).json({ error: 'Perfil não encontrado' })
    }

    // 🔗 Buscar links ativos
    const links = await Link.find({
      user: user._id,
      isActive: true
    })
      .sort({ order: 1 })
      .select('title url icon clicks likes')

    // 🧮 Followers info
    const followersCount = user.followers.length
    const followingCount = user.following.length

    const isFollowing = loggedUserId
      ? user.followers.some(id => id.toString() === loggedUserId)
      : false

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        profileBackground: user.profileBackground,
        followersCount,
        followingCount,
        isFollowing
      },
      links: links.map(link => ({
        _id: link._id,
        title: link.title,
        url: link.url,
        icon: link.icon,
        clicks: link.clicks,
        likesCount: link.likes.length
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar perfil público:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
