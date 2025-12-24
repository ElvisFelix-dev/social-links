import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      unique: true,
      required: true
    },

    username: {
      type: String,
      unique: true,
      required: true
    },

    avatar: {
      type: String,
      default: ''
    },

    bio: {
      type: String,
      maxlength: 160,
      default: ''
    },

    googleId: {
      type: String,
      default: null
    },

    // ✅ SELO DE VERIFICADO
    isVerified: {
      type: Boolean,
      default: false
    },

    /* ================= PERFIL ================= */

    profileBackground: {
      type: String,
      default: ''
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
