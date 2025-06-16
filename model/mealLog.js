const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  portionSize: {
    type: String,
    required: false,
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
  mealImage: {
    type: String, 
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meal', mealSchema);
