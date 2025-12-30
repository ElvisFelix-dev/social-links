import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'
import dotenv from 'dotenv'
import cloudinary from '../config/cloudinary.js'

dotenv.config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/users/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const googleAvatar = profile.photos?.[0]?.value

        if (!email) {
          return done(new Error('Email não encontrado no Google'), null)
        }

        let user = await User.findOne({ email })

        /* ======================
           UPLOAD AVATAR GOOGLE
        ====================== */
        let avatarUrl = null

        if (googleAvatar) {
          try {
            const upload = await cloudinary.uploader.upload(googleAvatar, {
              folder: 'avatars',
              transformation: [
                { width: 1200, height: 630, crop: 'fill' } // OG safe
              ]
            })

            avatarUrl = upload.secure_url
          } catch (err) {
            console.error('Erro ao subir avatar Google:', err.message)
          }
        }

        /* ======================
           NOVO USUÁRIO
        ====================== */
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            avatar: avatarUrl,
            googleId: profile.id,
            username: email.split('@')[0]
          })

          user.isNewUser = true
        } else {
          /* ======================
             USUÁRIO EXISTENTE
          ====================== */

          // Atualiza avatar APENAS se ainda não tiver um Cloudinary
          if (!user.avatar && avatarUrl) {
            user.avatar = avatarUrl
            await user.save()
          }

          user.isNewUser = false
        }

        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  )
)
