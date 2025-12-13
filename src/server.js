import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import passport from 'passport'

import userRoutes from './routes/userRoutes.js'
import linkRoutes from './routes/linkRoutes.js'
import publicRoutes from './routes/publicRoutes.js'

dotenv.config()

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

app.use('/api/users', userRoutes)
app.use('/api/links', linkRoutes)
app.use('/api', publicRoutes)

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`💻 Server running ${PORT}`)
})
