import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendWelcomeEmail } from '../utils/sendEmailWelcome.js'

/* ================= LOGIN GOOGLE ================= */
export const googleLogin = async (req, res) => {
  try {
    const user = req.user

    if (!user) {
      return res.status(401).json({ error: 'Autenticação falhou' })
    }

    // 🔐 Gera token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // ✉️ Envia email SOMENTE se for novo usuário
    if (user.isNewUser) {
      try {
        await sendWelcomeEmail({
          name: user.name,
          email: user.email
        })
      } catch (emailError) {
        console.error('Erro ao enviar email de boas-vindas:', emailError)
        // não quebra o login por causa do email
      }
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
    )
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro no login com Google' })
  }
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
    const { username } = req.params

    const targetUser = await User.findOne({ username })
      .select('_id followers')

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // visitante
    if (!req.user) {
      return res.json({
        isSelf: false,
        isFollowing: false
      })
    }

    const loggedUserId = req.user._id.toString()
    const targetUserId = targetUser._id.toString()

    const isSelf = loggedUserId === targetUserId

    const isFollowing = targetUser.followers.some(
      id => id.toString() === loggedUserId
    )

    return res.json({
      isSelf,
      isFollowing
    })
  } catch (error) {
    console.error('Follow status error:', error)
    return res.status(500).json({ error: 'Erro ao buscar follow status' })
  }
}

export const getFollowers = async (req, res) => {
  try {
    const { username } = req.params
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const user = await User.findOne({ username }).select('followers')

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const total = user.followers.length

    const followerIds = user.followers.slice(skip, skip + limit)

    const followers = await User.find(
      { _id: { $in: followerIds } },
      'username avatar'
    )

    return res.json({
      users: followers,
      page,
      limit,
      total,
      hasMore: skip + limit < total
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar seguidores' })
  }
}

export const getFollowing = async (req, res) => {
  try {
    const { username } = req.params
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const user = await User.findOne({ username }).select('following')

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const total = user.following.length
    const followingIds = user.following.slice(skip, skip + limit)

    const following = await User.find(
      { _id: { $in: followingIds } },
      'username avatar'
    )

    return res.json({
      users: following,
      page,
      limit,
      total,
      hasMore: skip + limit < total
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar seguindo' })
  }
}
