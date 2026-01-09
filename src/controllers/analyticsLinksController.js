import Link from '../models/Link.js'

export const getTopClickedLinks = async (req, res) => {
  try {
    const userId = req.user._id

    const links = await Link.find({ user: userId })
      .sort({ clicks: -1 })
      .limit(10)
      .select('title url clicks')

    res.json(
      links.map(link => ({
        linkId: link._id,
        title: link.title,
        url: link.url,
        clicks: link.clicks
      }))
    )
  } catch (error) {
    console.error('Erro ao buscar cliques dos links:', error)
    res.status(500).json({ error: 'Erro ao buscar cliques dos links' })
  }
}

export const getClicksOverview = async (req, res) => {
  try {
    const userId = req.user._id

    const result = await Link.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          clicks: { $sum: '$clicks' }
        }
      }
    ])

    res.json({
      clicks: result[0]?.clicks || 0
    })
  } catch (error) {
    console.error('Erro ao buscar total de cliques:', error)
    res.status(500).json({ error: 'Erro ao buscar total de cliques' })
  }
}
