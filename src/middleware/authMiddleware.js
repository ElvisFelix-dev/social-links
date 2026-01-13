// middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/* 🔐 Autenticação padrão */
export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de autenticação não fornecido'
      })
    }

    // Aceita: "Bearer token" ou só "token"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : authHeader.trim()

    if (!token) {
      return res.status(401).json({
        error: 'Token inválido'
      })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({
        error:
          err.name === 'TokenExpiredError'
            ? 'Sessão expirada, faça login novamente'
            : 'Token inválido'
      })
    }

    const user = await User.findById(decoded.id)
      .select('-password -googleId')

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      })
    }

    // 🛑 Usuário bloqueado
    if (user.blocked) {
      return res.status(403).json({
        error: 'Usuário bloqueado. Entre em contato com o suporte'
      })
    }

    /* Injeta dados do usuário */
    req.user = user
    req.userId = user._id
    req.isAdmin = user.role === 'admin'

    next()
  } catch (error) {
    console.error('AuthMiddleware error:', error)

    return res.status(500).json({
      error: 'Erro interno de autenticação'
    })
  }
}

/* 👑 Middleware exclusivo de admin */
export function authAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acesso restrito a administradores'
    })
  }

  next()
}
