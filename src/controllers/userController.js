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
    const userId = req.user?.id

    const user = await User.findById(userId).select(
      'name avatar username email bio profileTheme followers following'
    )

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
    const userId = req.user?.id
    const { username, bio } = req.body

    if (!username?.trim()) {
      return res.status(400).json({ error: 'Username é obrigatório' })
    }

    const usernameExists = await User.exists({
      username: username.toLowerCase().trim(),
      _id: { $ne: userId }
    })

    if (usernameExists) {
      return res.status(409).json({ error: 'Username já está em uso' })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        username: username.toLowerCase().trim(),
        bio: bio?.substring(0, 160) || ''
      },
      {
        new: true,
        runValidators: true,
        select: 'name avatar username email bio'
      }
    )

    return res.json(user)
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err)
    return res.status(500).json({ error: 'Erro ao atualizar perfil' })
  }
}

/* ================= FOLLOW / UNFOLLOW ================= */
export const toggleFollow = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const targetUserId = req.params.userId

    if (currentUserId === targetUserId) {
      return res.status(400).json({ error: 'Você não pode seguir a si mesmo' })
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ])

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const isFollowing = currentUser.following.includes(targetUserId)

    if (isFollowing) {
      currentUser.following.pull(targetUserId)
      targetUser.followers.pull(currentUserId)
    } else {
      currentUser.following.push(targetUserId)
      targetUser.followers.push(currentUserId)
    }

    await Promise.all([currentUser.save(), targetUser.save()])

    return res.json({
      following: !isFollowing,
      followersCount: targetUser.followers.length
    })
  } catch (err) {
    console.error('Erro ao seguir usuário:', err)
    return res.status(500).json({ error: 'Erro ao seguir usuário' })
  }
}

/* ================= UPDATE PROFILE THEME ================= */
export const updateProfileTheme = async (req, res) => {
  try {
    const userId = req.user.id
    const { backgroundType, backgroundValue } = req.body

    const backgroundImage = req.file?.path

    const profileTheme = {
      backgroundType: backgroundType || 'color',
      backgroundValue:
        backgroundType === 'image'
          ? backgroundImage
          : backgroundValue
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profileTheme },
      { new: true, select: 'profileTheme' }
    )

    return res.json(user)
  } catch (err) {
    console.error('Erro ao atualizar tema:', err)
    return res.status(500).json({ error: 'Erro ao atualizar tema' })
  }
}
