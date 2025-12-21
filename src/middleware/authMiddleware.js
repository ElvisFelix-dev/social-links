import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select(
      '_id name username email avatar profileTheme'
    )

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // 🔐 Padroniza o formato usado no controller
    req.user = {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      profileTheme: user.profileTheme
    }

    next()
  } catch (err) {
    console.error('Erro no authMiddleware:', err.message)

    return res.status(401).json({
      error: 'Token expirado ou inválido'
    })
  }
}
