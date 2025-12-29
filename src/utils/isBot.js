// utils/isBot.js
export function isBot(userAgent = '') {
  const bots = [
    'WhatsApp',
    'facebookexternalhit',
    'Twitterbot',
    'TelegramBot',
    'LinkedInBot'
  ]

  return bots.some(bot => userAgent.includes(bot))
}
