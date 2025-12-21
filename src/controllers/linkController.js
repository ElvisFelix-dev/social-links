import Link from '../models/Link.js'

// ➕ Criar link
export const createLink = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { title, url, icon } = req.body

    if (!title || !url) {
      return res.status(400).json({ error: 'Título e URL são obrigatórios' })
    }

    const totalLinks = await Link.countDocuments({
      user: req.user._id
    })

    const link = await Link.create({
      title,
      url,
      icon,
      order: totalLinks,
      user: req.user._id
    })

    return res.status(201).json(link)
  } catch (error) {
    console.error('Erro createLink:', error)
    return res.status(500).json({ error: 'Erro ao criar link' })
  }
}


// 📄 Listar links do usuário
export const getMyLinks = async (req, res) => {
  try {
    const links = await Link.find({ user: req.user._id })
      .sort({ order: 1 })

    return res.json(links)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar links' })
  }
}

// ✏️ Atualizar link
export const updateLink = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const link = await Link.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true }
    )

    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }

    return res.json(link)
  } catch (error) {
    console.error('Erro updateLink:', error)
    return res.status(500).json({ error: 'Erro ao atualizar link' })
  }
}

// ❌ Deletar link
export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params

    const link = await Link.findOneAndDelete({
      _id: id,
      user: req.user._id
    })

    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }

    return res.json({ message: 'Link removido com sucesso' })
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao deletar link' })
  }
}

// 🔀 Reordenar links
export const reorderLinks = async (req, res) => {
  try {
    const { links } = req.body
    // links: [{ id, order }]

    const bulkOps = links.map(link => ({
      updateOne: {
        filter: { _id: link.id, user: req.user._id },
        update: { order: link.order }
      }
    }))

    await Link.bulkWrite(bulkOps)

    return res.json({ message: 'Ordem atualizada' })
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao reordenar links' })
  }
}

export const toggleLike = async (req, res) => {
  const userId = req.user.id
  const { linkId } = req.params

  const link = await Link.findById(linkId)
  if (!link) {
    return res.status(404).json({ error: 'Link não encontrado' })
  }

  const hasLiked = link.likes.includes(userId)

  if (hasLiked) {
    link.likes.pull(userId)
  } else {
    link.likes.push(userId)
  }

  await link.save()

  return res.json({
    liked: !hasLiked,
    likesCount: link.likes.length
  })
}
