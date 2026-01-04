import ProfileVisit from '../models/ProfileVisit.js'
import { parseAnalytics } from '../utils/analytics.js'

export const registerProfileVisit = async (req, user) => {
  try {
    const analytics = parseAnalytics(req)

    await ProfileVisit.create({
      profileId: user._id,
      userId: user._id,
      ...analytics
    })
  } catch (err) {
    console.error('ProfileVisit error:', err.message)
  }
}
