import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendWelcomeEmail } from '../utils/sendEmailWelcome.js'
import { sendNewFollowerEmail } from '../utils/sendNewFollowerEmail.js'
import Notification from '../models/Notification.js'

import {ALLOWED_CATEGORIES} from '../constants/categories.js'

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
      { expiresIn: '1d' }
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

    const { username, bio, categories } = req.body

    /* ================= VALIDAR USERNAME ================= */

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username é obrigatório' })
    }

    const normalizedUsername = username.trim().toLowerCase()

    const existingUser = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: userId }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Username já está em uso' })
    }

    /* ================= MONTAR UPDATE ================= */

    const updateData = {
      username: normalizedUsername,
      bio: bio?.substring(0, 160) || ''
    }

    /* ================= CATEGORIES ================= */

    if (categories) {
      // multipart pode vir como string
      const parsedCategories = Array.isArray(categories)
        ? categories
        : JSON.parse(categories)

      const invalidCategories = parsedCategories.filter(
        c => !ALLOWED_CATEGORIES.includes(c)
      )

      if (invalidCategories.length > 0) {
        return res.status(400).json({
          error: 'Categorias inválidas',
          invalidCategories
        })
      }

      updateData.categories = parsedCategories
    }

    /* ================= BACKGROUND ================= */

    if (req.file?.path) {
      updateData.profileBackground = req.file.path
    }

    /* ================= UPDATE ================= */

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
        select:
          'name avatar username email bio profileBackground categories'
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
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const loggedUserId = req.user._id
    const { username } = req.params

    // 🔎 usuário a ser seguido
    const userToFollow = await User.findOne({ username }).session(session)

    if (!userToFollow) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // 🚫 não pode seguir a si mesmo
    if (userToFollow._id.equals(loggedUserId)) {
      return res.status(400).json({
        error: 'Você não pode seguir a si mesmo'
      })
    }

    // 🚫 evita follow duplicado (forma performática)
    const alreadyFollowing = await User.exists({
      _id: userToFollow._id,
      followers: loggedUserId
    })

    if (alreadyFollowing) {
      return res.status(409).json({
        error: 'Você já segue esse usuário'
      })
    }

    // 🔎 usuário que está seguindo
    const followerUser = await User.findById(loggedUserId)
      .select('name username avatar')
      .session(session)

    // ✅ atualiza seguidores e seguindo (atomicamente)
    await User.updateOne(
      { _id: userToFollow._id },
      { $addToSet: { followers: loggedUserId } },
      { session }
    )

    await User.updateOne(
      { _id: loggedUserId },
      { $addToSet: { following: userToFollow._id } },
      { session }
    )

    // 🔔 cria notificação
    await Notification.create([{
      user: userToFollow._id,
      fromUser: loggedUserId,
      type: 'follow'
    }], { session })

    // ✉️ envia e-mail (fora da lógica crítica)
    if (userToFollow.email) {
      sendNewFollowerEmail({
        toEmail: userToFollow.email,
        toName: userToFollow.name,
        followerName: followerUser.name,
        followerUsername: followerUser.username,
        followerAvatar: followerUser.avatar
      }).catch(err => {
        console.error(
          `❌ Falha ao enviar email de novo seguidor para ${userToFollow.email}`,
          err
        )
      })
    }

    await session.commitTransaction()
    session.endSession()

    return res.json({
      message: 'Usuário seguido com sucesso'
    })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()

    console.error('Erro ao seguir usuário:', err)

    return res.status(500).json({
      error: 'Erro ao seguir usuário'
    })
  }
}

export const unfollowUser = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const loggedUserId = req.user._id
    const { username } = req.params

    // 🔎 usuário a ser deixado de seguir
    const userToUnfollow = await User.findOne({ username }).session(session)

    if (!userToUnfollow) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      })
    }

    // 🚫 não pode dar unfollow em si mesmo
    if (userToUnfollow._id.equals(loggedUserId)) {
      return res.status(400).json({
        error: 'Você não pode dar unfollow em si mesmo'
      })
    }

    // 🔎 verifica se realmente está seguindo
    const isFollowing = await User.exists({
      _id: loggedUserId,
      following: userToUnfollow._id
    })

    if (!isFollowing) {
      return res.status(409).json({
        error: 'Você não segue esse usuário'
      })
    }

    // ✅ remove follow de forma atômica
    await User.updateOne(
      { _id: userToUnfollow._id },
      { $pull: { followers: loggedUserId } },
      { session }
    )

    await User.updateOne(
      { _id: loggedUserId },
      { $pull: { following: userToUnfollow._id } },
      { session }
    )

    // 🔕 remove notificação de follow (opcional)
    await Notification.deleteMany({
      user: userToUnfollow._id,
      fromUser: loggedUserId,
      type: 'follow'
    }).session(session)

    await session.commitTransaction()
    session.endSession()

    return res.json({
      message: 'Unfollow realizado com sucesso'
    })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()

    console.error('Erro ao dar unfollow:', err)

    return res.status(500).json({
      error: 'Erro ao dar unfollow'
    })
  }
}

/* ================= FOLLOW STATUS ================= */
export const getFollowStatus = async (req, res) => {
  try {
    const { username } = req.params

    const targetUser = await User.findOne({ username })
      .select('_id followers following')

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const followersCount = targetUser.followers.length
    const followingCount = targetUser.following.length

    // 👤 VISITANTE
    if (!req.user) {
      return res.json({
        isSelf: false,
        isFollowing: false,
        followersCount,
        followingCount
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
      isFollowing,
      followersCount,
      followingCount
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

/* ================= GET USER BY USERNAME (PERFIL PÚBLICO) ================= */
export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params

    // Busca usuário e popula arrays de seguidores/seguindo apenas com o tamanho se necessário,
    // mas aqui vamos pegar o objeto e contar via .length
    const user = await User.findOne({ username })
      .select('name avatar username bio profileBackground followers following createdAt')

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Retorna os dados públicos + contagens
    return res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      profileBackground: user.profileBackground,
      createdAt: user.createdAt,
      // 👇 AQUI ESTÁ A MÁGICA DOS NÚMEROS
      followersCount: user.followers.length,
      followingCount: user.following.length
    })

  } catch (err) {
    console.error('Erro ao buscar perfil:', err)
    return res.status(500).json({ error: 'Erro ao buscar perfil público' })
  }
}

/* ================= SUGGESTED USERS ================= */
export const getSuggestedUsers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5
    const loggedUserId = req.user._id

    // 🔎 Busca quem o usuário já segue
    const loggedUser = await User.findById(loggedUserId)
      .select('following')

    if (!loggedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const users = await User.aggregate([
      {
        $match: {
          _id: {
            // 🚫 remove o próprio usuário
            $ne: loggedUserId,
            // 🚫 remove quem ele já segue
            $nin: loggedUser.following
          }
        }
      },
      { $sample: { size: limit } },
      {
        $project: {
          name: 1,
          username: 1,
          avatar: 1,
          followersCount: { $size: '$followers' }
        }
      }
    ])

    return res.json(users)
  } catch (err) {
    console.error('Erro ao buscar sugestões:', err)
    return res.status(500).json({ error: 'Erro ao buscar sugestões' })
  }
}

/* ================= EXPLORE USERS ================= */
export const exploreUsers = async (req, res) => {
  try {
    const { search, category } = req.query
    const limit = Number(req.query.limit) || 20
    const loggedUserId = req.user?._id

    const query = {}

    // 🔎 Busca textual
    if (search) {
      query.$text = { $search: search }
    }

    // 🏷️ Categoria
    if (category) {
      query.categories = category
    }

    // 🚫 Exclui o próprio usuário
    if (loggedUserId) {
      query._id = { $ne: loggedUserId }
    }

    const users = await User.aggregate([
      { $match: query },
      {
        $addFields: {
          followersCount: { $size: '$followers' }
        }
      },
      {
        $sort: {
          isVerified: -1,
          followersCount: -1,
          createdAt: -1
        }
      },
      {
        $project: {
          name: 1,
          username: 1,
          avatar: 1,
          bio: 1,
          categories: 1,
          followersCount: 1,
          isVerified: 1
        }
      },
      { $limit: limit }
    ])

    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar perfis' })
  }
}


export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q

    if (!q) return res.json([])

    const users = await User.find(
      { $text: { $search: q } },
      'name username avatar'
    ).limit(20)

    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Erro na busca' })
  }
}

export const getUserSuggestions = async (req, res) => {
  try {
    const loggedUserId = req.user?._id

    const query = loggedUserId
      ? { _id: { $ne: loggedUserId } }
      : {}

    const users = await User.aggregate([
      { $match: query },
      { $sample: { size: 5 } },
      {
        $project: {
          name: 1,
          username: 1,
          avatar: 1
        }
      }
    ])

    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar sugestões' })
  }
}

