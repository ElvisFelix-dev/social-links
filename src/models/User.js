import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    avatar: String,
    bio: {
      type: String,
      maxlength: 160
    },
    googleId: String,
    username: {
      type: String,
      unique: true,
      required: true
    }
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
