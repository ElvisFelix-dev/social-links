// utils/analytics.js
import { UAParser } from 'ua-parser-js'

export function parseAnalytics(req) {
  try {
    const ua = req.headers['user-agent'] || ''
    const parser = new UAParser(ua)
    const result = parser.getResult()

    return {
      ip:
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket?.remoteAddress ||
        null,

      userAgent: ua,

      device: result.device.type || 'desktop',
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',

      country:
        req.headers['x-vercel-ip-country'] ||
        req.headers['cf-ipcountry'] ||
        null,

      city:
        req.headers['x-vercel-ip-city'] ||
        req.headers['cf-ipcity'] ||
        null,

      referrer: req.headers.referer || null
    }
  } catch (err) {
    console.error('parseAnalytics error:', err.message)
    return {}
  }
}
