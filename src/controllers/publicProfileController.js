// controllers/publicProfileController.js
import User from '../models/User.js'
import Link from '../models/Link.js'

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params

    // 🔎 Buscar usuário
    const user = await User.findOne({ username })
      .select(
        `
          name
          username
          avatar
          bio
          email
          profileBackground
          isVerified
          followers
          following
        `
      )

    if (!user) {
      return res.status(404).json({ error: 'Perfil não encontrado' })
    }

    // 🔗 Buscar links ativos do usuário
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
        isVerified: user.isVerified, // ✅ selo
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
