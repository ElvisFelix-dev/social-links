import jwt from 'jsonwebtoken'

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

