import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token inválido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-googleId')

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token expirado ou inválido' })
  }
}
