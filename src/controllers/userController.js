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

    const user = await User.findById(userId)
      .select('name avatar username email bio profileBackground followers following')

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.json({
      name: user.name,
      avatar: user.avatar,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileBackground: user.profileBackground,
      followersCount: user.followers.length,
      followingCount: user.following.length
    })
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

    // 🔹 Para segurança: req.body pode vir undefined com multipart/form-data
    const username = req.body?.username
    const bio = req.body?.bio

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username é obrigatório' })
    }

    const existingUser = await User.findOne({
      username: username.trim(),
      _id: { $ne: userId }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Username já está em uso' })
    }

    // 🧠 Monta update dinâmico
    const updateData = {
      username: username.trim(),
      bio: bio?.substring(0, 160) || ''
    }

    // 🖼️ BACKGROUND VIA MULTER + CLOUDINARY
    if (req.file?.path) {
      updateData.profileBackground = req.file.path
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
        select: 'name avatar username email bio profileBackground'
      }
    )

    return res.json(updatedUser)
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err)
    return res.status(500).json({ error: 'Erro ao atualizar perfil' })
  }
}

/* ================= FOLLOW USER ================= */
export const followUser = async (req, res) => {
  try {
    const loggedUserId = req.user._id
    const { username } = req.params

    const userToFollow = await User.findOne({ username })

    if (!userToFollow) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // 🚫 não pode seguir a si mesmo
    if (userToFollow._id.equals(loggedUserId)) {
      return res.status(400).json({ error: 'Você não pode seguir a si mesmo' })
    }

    // 🚫 evita follow duplicado
    if (userToFollow.followers.includes(loggedUserId)) {
      return res.status(409).json({ error: 'Você já segue esse usuário' })
    }

    await User.findByIdAndUpdate(userToFollow._id, {
      $push: { followers: loggedUserId }
    })

    await User.findByIdAndUpdate(loggedUserId, {
      $push: { following: userToFollow._id }
    })

    return res.json({ message: 'Usuário seguido com sucesso' })
  } catch (err) {
    console.error('Erro ao seguir usuário:', err)
    return res.status(500).json({ error: 'Erro ao seguir usuário' })
  }
}

/* ================= UNFOLLOW USER ================= */
export const unfollowUser = async (req, res) => {
  try {
    const loggedUserId = req.user._id
    const { username } = req.params

    const userToUnfollow = await User.findOne({ username })

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    await User.findByIdAndUpdate(userToUnfollow._id, {
      $pull: { followers: loggedUserId }
    })

    await User.findByIdAndUpdate(loggedUserId, {
      $pull: { following: userToUnfollow._id }
    })

    return res.json({ message: 'Unfollow realizado com sucesso' })
  } catch (err) {
    console.error('Erro ao dar unfollow:', err)
    return res.status(500).json({ error: 'Erro ao dar unfollow' })
  }
}

/* ================= FOLLOW STATUS ================= */
export const getFollowStatus = async (req, res) => {
  try {
    const loggedUserId = req.user.id
    const { username } = req.params

    const targetUser = await User.findOne({ username })
      .populate('followers')
      .populate('following')

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const isSelf = targetUser._id.toString() === loggedUserId

    const isFollowing = targetUser.followers.some(
      follower => follower._id.toString() === loggedUserId
    )

    res.json({
      isSelf,
      isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar follow status' })
  }
}

