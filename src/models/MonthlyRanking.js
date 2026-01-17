import mongoose from 'mongoose'

const MonthlyRankingSchema = new Schema({
  month: String, // 2026-01
  userId: ObjectId,
  visits: Number,
  position: Number
})
export default mongoose.model('MonthlyRanking', MonthlyRankingSchema)
