import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    // 1️⃣ Token não enviado
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token não fornecido'
      })
    }

    // 2️⃣ Aceita "Bearer token" ou só "token"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader

    if (!token) {
      return res.status(401).json({
        error: 'Token inválido'
      })
    }

    // 3️⃣ Verifica e decodifica o token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({
        error: err.name === 'TokenExpiredError'
          ? 'Token expirado'
          : 'Token inválido'
      })
    }

    // 4️⃣ Garante que o usuário ainda existe
    const user = await User.findById(decoded.id)
      .select('-password -googleId')

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não existe mais'
      })
    }

    // 5️⃣ Injeta dados do usuário na request
    req.user = user
    req.userId = user._id

    next()
  } catch (error) {
    console.error('AuthMiddleware error:', error)

    return res.status(500).json({
      error: 'Erro interno de autenticação'
    })
  }
}

export default authMiddleware
