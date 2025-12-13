import User from '../models/User.js'
import Link from '../models/Link.js'

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params

    const user = await User.findOne({ username })
      .select('name avatar bio username')

    if (!user) {
      return res.status(404).json({ error: 'Perfil não encontrado' })
    }

    const links = await Link.find({
      user: user._id,
      isActive: true
    }).sort({ order: 1 })

    return res.json({ user, links })
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao carregar perfil' })
  }
}
