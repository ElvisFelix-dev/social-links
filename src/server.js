import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import passport from 'passport'
import dotenv from 'dotenv'

dotenv.config()

import './config/passport.js'
import User from './models/User.js'
import { isBot } from './utils/isBot.js'
import { testCloudinaryConnection } from './config/cloudinary.js'

import testRoutes from './routes/test.routes.js'

import userRoutes from './routes/userRoutes.js'
import linkRoutes from './routes/linkRoutes.js'
import publicRoutes from './routes/publicRoutes.js'
import likeRoutes from './routes/likeRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import analyticsDashboardRoutes from './routes/analyticsDashboardRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import analyticsLinksRoutes from './routes/analyticsLinksRoutes.js'

const app = express()

/* ======================
   ROBOTS.TXT (FACEBOOK / WHATSAPP / TWITTER)
====================== */
app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send(
`User-agent: *
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: WhatsApp
Allow: /
`
  )
})

/* ======================
   BASE
====================== */
app.use(express.json())
app.use(cors())
app.use(passport.initialize())

/* ======================
   DB
====================== */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('📊 Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err.message))

/* ======================
   HEALTH CHECK
====================== */
app.get('/test-server', (req, res) => {
  res.send('LinksAll API online! ✅')
})

/* ======================
   OG PREVIEW (ONLY BOTS)
====================== */
app.get('/:username', async (req, res, next) => {
  const { username } = req.params
  const userAgent = req.headers['user-agent'] || ''

  // ignora rotas técnicas
  if (
    username.startsWith('api') ||
    username.includes('.') ||
    username === 'favicon.ico'
  ) {
    return next()
  }

  // ⚠️ BOT SEMPRE RECEBE HTML
  if (isBot(userAgent)) {
    try {
      const user = await User.findOne({ username })
        .select('name bio avatar username')

      if (!user) {
        return res.status(200).send('<!DOCTYPE html><html><head></head><body></body></html>')
      }

      const avatar =
        user.avatar?.includes('cloudinary')
          ? user.avatar.replace('/upload/', '/upload/w_1200,h_630,c_fill/')
          : 'https://res.cloudinary.com/linksall/image/upload/w_1200,h_630,c_fill/og-default.png'

      res.set('Content-Type', 'text/html')
      res.status(200)

      return res.send(`<!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>${user.name} • LinksAll</title>

          <meta property="og:type" content="profile" />
          <meta property="og:title" content="${user.name}" />
          <meta property="og:description" content="${user.bio || 'Veja meus links no LinksAll'}" />
          <meta property="og:image" content="${avatar}" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:url" content="${process.env.FRONTEND_URL}/${user.username}" />

          <meta name="twitter:card" content="summary_large_image" />
        </head>
        <body></body>
        </html>
      `)
    } catch (err) {
      return res.status(200).send('<!DOCTYPE html><html><head></head><body></body></html>')
    }
  }

  // 👤 Usuário real → frontend
  return res.redirect(`${process.env.FRONTEND_URL}/${username}`)
})

/* ======================
   API ROUTES
====================== */
app.use('/api/users', userRoutes)
app.use('/api/links', linkRoutes)
app.use('/api', publicRoutes)
app.use('/api/likes', likeRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/analytics', analyticsDashboardRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/metric', analyticsLinksRoutes)

app.use('/api/test', testRoutes)

/* ======================
   CLOUDINARY
====================== */
testCloudinaryConnection()

/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`💻 API running on port ${PORT}`)
})
