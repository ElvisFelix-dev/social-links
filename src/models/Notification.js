import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
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
  {
    timestamps: true
  }
)

export default mongoose.model('Notification', notificationSchema)
