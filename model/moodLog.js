// models/MoodLog.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const MoodLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moodScore: {
    type: Number, // e.g., 1-5 or 1-10 scale
    required: true,
    min: 1,
    max: 10
  },
  moodEmoji: {
    type: String,
    default: null
  },
  reasonText: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('MoodLog', MoodLogSchema);
