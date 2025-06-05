// models/MealLog.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const MealLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodName: {
    type: String,
    required: true,
    trim: true
  },
  photoUrl: {
    type: String,
    default: null // Optional photo
  },
  portionSize: {
    type: String, // e.g. "1 cup", "medium plate"
    default: null
  },
  timeEaten: {
    type: Date,
    required: true
  },
  tags: {
    type: [String], // e.g. ['Craving', 'Healthy', 'Emotional']
    default: []
  },
  moodLinkId: {
    type: Schema.Types.ObjectId,
    ref: 'MoodLog',
    default: null // Optional link to mood
  },
  mindfulPromptDone: {
    type: Boolean,
    default: false // If they did the 30-second pause
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('MealLog', MealLogSchema);
