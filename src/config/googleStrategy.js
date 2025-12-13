import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'
import { sendWelcomeEmail } from '../utils/sendWelcomeEmail.js'
import { generateUniqueUsername } from '../utils/generateUniqueUsername.js'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value

        if (!email) {
          return done(new Error('Email não encontrado no Google'), null)
        }

        let user = await User.findOne({ email })
        let isNewUser = false

        if (!user) {
          const baseUsername = email.split('@')[0]
          const username = await generateUniqueUsername(baseUsername)

          user = await User.create({
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value,
            googleId: profile.id,
            username
          })

          isNewUser = true

          // 📧 Enviar e-mail de boas-vindas (não bloqueante)
          sendWelcomeEmail({
            name: user.name,
            email: user.email
          }).catch(err => {
            console.error('Erro ao enviar e-mail:', err.message)
          })
        }

        /**
         * ⚠️ Passport só aceita:
         * done(error, user)
         * Flags extras vão no req.session se precisar
         */
        return done(null, user)
      } catch (error) {
        console.error('Erro Google Strategy:', error)
        return done(error, null)
      }
    }
  )
)

export default passport
