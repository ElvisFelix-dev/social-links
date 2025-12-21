import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    googleId: {
      type: String,
      index: true
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

    // 🔹 Social
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],

    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],

    // 🎨 Perfil público / Tema
    profileTheme: {
      backgroundType: {
        type: String,
        enum: ['color', 'gradient', 'image'],
        default: 'color'
      },

      backgroundValue: {
        type: String,
        default: '#000000'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

/* =========================
   🔥 VIRTUALS ÚTEIS
========================= */

// Quantidade de seguidores
userSchema.virtual('followersCount').get(function () {
  return this.followers?.length || 0
})

// Quantidade de seguindo
userSchema.virtual('followingCount').get(function () {
  return this.following?.length || 0
})


export default mongoose.model('User', userSchema)
