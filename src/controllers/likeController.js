import Like from '../models/Like.js'

export const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id
    const { linkId } = req.params

    const existingLike = await Like.findOne({
      user: userId,
      link: linkId
    })

    if (existingLike) {
      await existingLike.deleteOne()
      return res.json({ liked: false })
    }

    await Like.create({
      user: userId,
      link: linkId
    })

    res.json({ liked: true })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao curtir link' })
  }
}

export const getLikeStatus = async (req, res) => {
  const userId = req.user.id
  const { linkId } = req.params

  const like = await Like.findOne({ user: userId, link: linkId })

  res.json({ liked: !!like })
}

export const getLikeCount = async (req, res) => {
  const { linkId } = req.params

  const count = await Like.countDocuments({ link: linkId })

  res.json({ likes: count })
}
