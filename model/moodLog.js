import mongoose from 'mongoose';

const { Schema } = mongoose;

const MoodLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moodScore: {
    type: String,
    required: true,
    enum: ['Frustrated', 'Sad', 'Happy', 'Anxious', 'Grateful', 'Neutral']
  },
  moodEmoji: {
    type: String,
    default: function () {
      switch (this.moodScore) {
        case 'Happy':
          return '😊';
        case 'Sad':
          return '😞';
        case 'Frustrated':
          return '😣';
        case 'Anxious':
          return '😟';
        case 'Grateful':
          return '🙏';
        case 'Neutral':
          return '😐';
        default:
          return '😐';
      }
    }
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
