import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token não fornecido'
      })
    }

    // Aceita "Bearer token" ou só "token"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader

    if (!token) {
      return res.status(401).json({
        error: 'Token inválido'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password -googleId')

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      })
    }

    // 🔥 Padrão profissional
    req.user = user
    req.userId = user._id

    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Token expirado ou inválido'
    })
  }
}

export default authMiddleware
