import mongoose from 'mongoose'

const LinkClickSchema = new mongoose.Schema(
  {
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', index: true },
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    ip: String,
    userAgent: String,
    device: String,
    browser: String,
    os: String,

    country: String,
    city: String,
    referrer: String
  },
  { timestamps: true }
)

LinkClickSchema.index({ createdAt: 1 })

export default mongoose.model('LinkClick', LinkClickSchema)
