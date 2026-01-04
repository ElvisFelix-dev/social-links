import mongoose from 'mongoose'

const ProfileVisitSchema = new mongoose.Schema(
  {
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

ProfileVisitSchema.index({ createdAt: 1 })

export default mongoose.model('ProfileVisit', ProfileVisitSchema)
