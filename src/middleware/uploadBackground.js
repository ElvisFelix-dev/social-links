// src/middleware/uploadBackground.js
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'social-links/backgrounds',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
})

const uploadBackground = multer({ storage })

export default uploadBackground
