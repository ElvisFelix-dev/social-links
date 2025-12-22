import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
      required: true
    }
  },
  { timestamps: true }
)

// 🔒 Evita like duplicado (user + link)
likeSchema.index({ user: 1, link: 1 }, { unique: true })

export default mongoose.model('Like', likeSchema)
