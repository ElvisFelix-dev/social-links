import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const optionalAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    req.user = null
    return next()
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('_id')
    req.user = user || null
  } catch (err) {
    req.user = null
  }

  next()
}

export default optionalAuthMiddleware
