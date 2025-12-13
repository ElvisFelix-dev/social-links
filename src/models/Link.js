import mongoose from 'mongoose'

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    icon: String,
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

// ⚡ índices importantes
linkSchema.index({ user: 1 })
linkSchema.index({ isActive: 1 })
linkSchema.index({ order: 1 })

export default mongoose.model('Link', linkSchema)
