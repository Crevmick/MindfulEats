const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  portionSize: {
    type: String,
    required: false,
  },
  foodCategory: {
    type: String,
    required: false,
  },
  mealType: {
  type: String,
  enum: ['breakfast', 'lunch', 'dinner', 'snack'],
  required: false
},
  hungerBefore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  hungerAfter: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    required: false,
    maxlength: 500, // Optional: Prevent too long entries
  },
  predictedFoodName: {
    type: String,
    required: false
  },
  mealImage: {
    type: String, 
    required: false
  },
  // Field for the one mood explicitly linked by the user to this meal
  moodLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoodLog',
    required: false
  },
  // Field for storing TF.js model's predicted mood (if that feature is used)
  predictedPostMealMood: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meal', mealSchema);
