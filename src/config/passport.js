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
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        /* ======================
           DADOS DO GOOGLE
        ====================== */
        const email = profile.emails?.[0]?.value
        const googleAvatar = profile.photos?.[0]?.value
        const displayName = profile.displayName

        if (!email) {
          return done(new Error('Email não encontrado no Google'), null)
        }

        /* ======================
           BUSCA USUÁRIO
        ====================== */
        let user = await User.findOne({ email })

        /* ======================
           UPLOAD AVATAR (SE NECESSÁRIO)
        ====================== */
        let avatarUrl = null

        const shouldUploadAvatar =
          googleAvatar &&
          (!user || !user.avatar || !user.avatar.includes('cloudinary'))

        if (shouldUploadAvatar) {
          try {
            const upload = await cloudinary.uploader.upload(googleAvatar, {
              folder: 'avatars',
              public_id: email.split('@')[0],
              overwrite: false,
              transformation: [
                {
                  width: 400,
                  height: 400,
                  crop: 'fill',
                  gravity: 'face'
                }
              ]
            })

            avatarUrl = upload.secure_url
          } catch (err) {
            console.error('❌ Erro ao subir avatar Google:', err.message)
          }
        }

        /* ======================
           NOVO USUÁRIO
        ====================== */
        if (!user) {
          user = await User.create({
            name: displayName,
            email,
            avatar: avatarUrl,
            googleId: profile.id,
            username: email.split('@')[0]
          })

          // ✅ flag temporária (não salva no banco)
          user._isNewUser = true
        } else {
          /* ======================
             USUÁRIO EXISTENTE
          ====================== */

          if (!user.avatar && avatarUrl) {
            user.avatar = avatarUrl
            await user.save()
          }

          user._isNewUser = false
        }

        return done(null, user)
      } catch (err) {
        console.error('❌ Google Auth error:', err)
        return done(err, null)
      }
    }
  )
)
