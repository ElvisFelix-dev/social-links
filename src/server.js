import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import passport from 'passport'

import dotenv from 'dotenv'

dotenv.config()

import './config/passport.js'

import {testCloudinaryConnection} from './config/cloudinary.js'

import userRoutes from './routes/userRoutes.js'
import linkRoutes from './routes/linkRoutes.js'
import publicRoutes from './routes/publicRoutes.js'
import likeRoutes from './routes/likeRoutes.js'

const app = express()
app.use(express.json())
app.use(cors())
app.use(passport.initialize())

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('📊 Connected to db'))
  .catch((err) => console.error('Error connected db:', err.message))

app.get('/test-server', (req, res) => {
  res.send('Social Links online! ✅')
})

testCloudinaryConnection()

app.use('/api/users', userRoutes)
app.use('/api/links', linkRoutes)
app.use('/api', publicRoutes)
app.use('/api/likes', likeRoutes)

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`💻 Server running ${PORT}`)
})
