import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/users/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value

        let user = await User.findOne({ email })

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value,
            googleId: profile.id,
            username: email.split('@')[0]
          })
        }

        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  )
)
