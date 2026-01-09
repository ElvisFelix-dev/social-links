import Link from '../models/Link.js'
import ProfileVisit from '../models/ProfileVisit.js'

/**
 * 🔹 Helper interno
 * Soma total de cliques dos links do usuário
 */
const getTotalClicks = async (userId) => {
  const result = await Link.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        clicks: { $sum: '$clicks' }
      }
    }
  ])

  return result[0]?.clicks || 0
}

/**
 * 🔹 OVERVIEW (Visitas + Cliques)
 */
export const getOverview = async (req, res) => {
  try {
    const userId = req.user._id

    const [visits, clicks] = await Promise.all([
      ProfileVisit.countDocuments({ userId }),
      getTotalClicks(userId)
    ])

    res.json({ visits, clicks })
  } catch (error) {
    console.error('[ANALYTICS][OVERVIEW]', error)
    res.status(500).json({ error: 'Erro ao buscar overview' })
  }
}

/**
 * 🔹 TOP LINKS (ranking)
 */
export const getTopClickedLinks = async (req, res) => {
  try {
    const userId = req.user._id

    const links = await Link.find(
      { user: userId, isActive: true },
      { title: 1, url: 1, clicks: 1 }
    )
      .sort({ clicks: -1 })
      .limit(10)
      .lean()

    res.json(
      links.map(link => ({
        linkId: link._id,
        title: link.title,
        url: link.url,
        clicks: link.clicks
      }))
    )
  } catch (error) {
    console.error('[ANALYTICS][TOP-LINKS]', error)
    res.status(500).json({ error: 'Erro ao buscar top links' })
  }
}
