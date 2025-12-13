import User from '../models/User.js'

export const generateUniqueUsername = async (base) => {
  let username = base
  let count = 0

  while (await User.findOne({ username })) {
    count++
    username = `${base}_${count}`
  }

  return username
}
