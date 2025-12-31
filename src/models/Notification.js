import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['follow'],
      required: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

// 🔒 impede notificações duplicadas do mesmo tipo
notificationSchema.index(
  { user: 1, fromUser: 1, type: 1 },
  { unique: true }
)

export default mongoose.model('Notification', notificationSchema)
