import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      index: true
    },

    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
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

    googleId: {
      type: String,
      default: null
    },

    /* ================= STATUS ================= */

    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },

    /* ================= PERFIL ================= */

    profileBackground: {
      type: String,
      default: ''
    },

    notificationSettings: {
      welcomeEmail: {
        type: Boolean,
        default: true
      },
      newFollowerEmail: {
        type: Boolean,
        default: true
      }
    },

    /* ================= SOCIAL ================= */

    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    /* ================= EXPLORE ================= */

    categories: {
      type: [String],
      enum: ['Criadores', 'Negócios', 'Desenvolvedores', 'Design', 'Marketing'],
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

/* ================= VIRTUALS ================= */

userSchema.virtual('followersCount').get(function () {
  return this.followers?.length || 0
})

userSchema.virtual('followingCount').get(function () {
  return this.following?.length || 0
})

userSchema.virtual('isProfileComplete').get(function () {
  return Boolean(this.avatar && this.bio)
})

/* ================= INDEXES ================= */

// busca textual
userSchema.index({
  name: 'text',
  username: 'text',
  bio: 'text'
})

// ranking / explore
userSchema.index({
  isVerified: -1,
  createdAt: -1
})

export default mongoose.model('User', userSchema)
