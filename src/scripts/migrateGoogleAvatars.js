import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cloudinary from '../config/cloudinary.js'
import User from '../models/User.js'

dotenv.config()

async function migrateAvatars() {
  await mongoose.connect(process.env.MONGODB_URI)

  console.log('🔎 Buscando usuários com avatar do Google...')

  const users = await User.find({
    avatar: { $regex: 'googleusercontent.com' }
  })

  console.log(`👤 Encontrados: ${users.length} usuários`)

  for (const user of users) {
    try {
      console.log(`➡ Migrando: ${user.username}`)

      const upload = await cloudinary.uploader.upload(user.avatar, {
        folder: 'avatars',
        public_id: user.username,
        overwrite: false,
        transformation: [
          { width: 1200, height: 630, crop: 'fill', gravity: 'face' }
        ]
      })

      user.avatar = upload.secure_url
      await user.save()

      console.log(`✅ Avatar migrado: ${user.username}`)
    } catch (err) {
      console.error(`❌ Erro em ${user.username}:`, err.message)
    }
  }

  console.log('🎉 Migração finalizada!')
  process.exit()
}

migrateAvatars()
