import mongoose from 'mongoose'

const clickSchema = new mongoose.Schema(
  {
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ip: String,
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
)

export default mongoose.model('Click', clickSchema)
