// utils/analytics.js
import { UAParser } from 'ua-parser-js'
import geoip from 'geoip-lite'

export function parseAnalytics(req) {
  try {
    const ua = req.headers['user-agent'] || ''
    const parser = new UAParser(ua)
    const result = parser.getResult()

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      null

    const geo = ip ? geoip.lookup(ip) : null

    return {
      ip,
      userAgent: ua,

      device: result.device.type || 'desktop',
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',

      country: geo?.country || null,
      region: geo?.region || null, // ← ESTADO
      city: geo?.city || null,

      referrer: req.headers.referer || null
    }
  } catch (err) {
    console.error('parseAnalytics error:', err.message)
    return {}
  }
}
