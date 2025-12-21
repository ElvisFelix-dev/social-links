import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/* ================= LOGIN GOOGLE ================= */
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

/* ================= GET CURRENT USER ================= */
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

/* ================= UPDATE PROFILE ================= */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { username, bio } = req.body

    // Valida username
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username é obrigatório' })
    }

    const existingUser = await User.findOne({ username, _id: { $ne: userId } })
    if (existingUser) {
      return res.status(409).json({ error: 'Username já está em uso' })
    }

    // Atualiza o usuário
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username: username.trim(),
        bio: bio?.substring(0, 160) || ''
      },
      { new: true, runValidators: true, select: 'name avatar username email bio' }
    )

    return res.json(updatedUser)
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err)
    return res.status(500).json({ error: 'Erro ao atualizar perfil' })
  }
}
