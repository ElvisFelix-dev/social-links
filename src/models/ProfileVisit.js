import mongoose from 'mongoose'

const ProfileVisitSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },

    // ⚠️ ideal futuramente: hash do IP (LGPD)
    ip: String,
    userAgent: String,

    device: String,
    browser: String,
    os: String,

    country: { type: String, index: true },
    region: { type: String, index: true }, // ← ESTADO (SP, RJ, MG)
    city: String,

    referrer: String
  },
  { timestamps: true }
)

ProfileVisitSchema.index({ createdAt: 1 })

export default mongoose.model('ProfileVisit', ProfileVisitSchema)
