import Link from '../models/Link.js'
import LinkClick from '../models/LinkClick.js'
import { parseAnalytics } from '../utils/analytics.js'

export const redirectLink = async (req, res) => {
  const { linkId } = req.params

  const link = await Link.findById(linkId)
  if (!link) return res.status(404).send('Link não encontrado')

  // Incremento rápido (performance)
  Link.findByIdAndUpdate(linkId, { $inc: { clicks: 1 } }).exec()

  try {
    const analytics = parseAnalytics(req)

    await LinkClick.create({
      linkId: link._id,
      profileId: link.userId,
      userId: link.userId,
      ...analytics
    })
  } catch (err) {
    console.error('LinkClick error:', err.message)
  }

  return res.redirect(link.url)
}
