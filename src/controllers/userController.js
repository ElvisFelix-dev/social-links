import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const googleLogin = (req, res) => {
  const user = req.user

  if (!user) {
    return res.status(401).json({ error: 'Autenticação falhou' })
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return res.redirect(
    `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
  )
}

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const user = await User.findById(userId).select('name avatar username email bio')
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.json(user)
  } catch (err) {
    console.error('Erro ao buscar usuário:', err)
    return res.status(500).json({ error: 'Erro ao buscar usuário' })
  }
}

