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

import userRoutes from './routes/userRoutes.js'
import linkRoutes from './routes/linkRoutes.js'
import publicRoutes from './routes/publicRoutes.js'
import likeRoutes from './routes/likeRoutes.js'

const app = express()

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
  .then(() => console.log('📊 Connected to db'))
  .catch(err => console.error('❌ DB error:', err.message))

/* ======================
   HEALTH
====================== */
app.get('/test-server', (req, res) => {
  res.send('LinksAll API online! ✅')
})

/* ======================
   OG PREVIEW (BOTS ONLY)
====================== */
app.get('/:username', async (req, res, next) => {
  const { username } = req.params
  const userAgent = req.headers['user-agent'] || ''

  // ignora chamadas que não são perfil público
  if (
    username.startsWith('api') ||
    username.includes('.') ||
    username === 'favicon.ico'
  ) {
    return next()
  }

  // Usuário normal → frontend
  if (!isBot(userAgent)) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/${username}`
    )
  }

  try {
    const user = await User.findOne({ username }).select(
      'name bio avatar username'
    )

    if (!user) {
      return res.redirect(process.env.FRONTEND_URL)
    }

    // Avatar seguro para OG
    const avatar =
      user.avatar && user.avatar.includes('cloudinary')
      ? user.avatar.replace('/upload/', '/upload/w_1200,h_630,c_fill/')
      : 'https://res.cloudinary.com/linksall/image/upload/w_1200,h_630,c_fill/og-default.png'

    res.set('Content-Type', 'text/html')

    return res.send(`<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${user.name} • LinksAll</title>

      <!-- Open Graph -->
      <meta property="og:type" content="profile" />
      <meta property="og:title" content="${user.name}" />
      <meta property="og:description" content="${user.bio || 'Veja meus links no LinksAll'}" />
      <meta property="og:image" content="${avatar}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="${process.env.FRONTEND_URL}/${user.username}" />

      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${user.name}" />
      <meta name="twitter:description" content="${user.bio || 'Veja meus links no LinksAll'}" />
      <meta name="twitter:image" content="${avatar}" />
    </head>
    <body></body>
    </html>`)
  } catch (err) {
    console.error('❌ OG Preview error:', err)
    return res.redirect(process.env.FRONTEND_URL)
  }
})

/* ======================
   API ROUTES
====================== */
app.use('/api/users', userRoutes)
app.use('/api/links', linkRoutes)
app.use('/api', publicRoutes)
app.use('/api/likes', likeRoutes)

/* ======================
   CLOUDINARY
====================== */
testCloudinaryConnection()

/* ======================
   START
====================== */
const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`💻 API running on port ${PORT}`)
})
