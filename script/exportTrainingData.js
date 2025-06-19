import mongoose from 'mongoose';
import fs from 'fs';
import Meal from '../models/Meal.js';
import MoodLog from '../models/MoodLog.js';

const portionSizeMap = { small: 0, medium: 1, large: 2 };

function mapPortionSize(size) {
  return portionSizeMap[size?.toLowerCase()] ?? 1;
}

// Use environment variable for MongoDB URI, with a default for local development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindfulleats_dev_db';

async function run() {
  await mongoose.connect(MONGODB_URI);

  const allData = [];
  const users = await Meal.distinct('userId');

  for (const userId of users) {
    const meals = await Meal.find({ userId });
    const moods = await MoodLog.find({ userId });

    for (const meal of meals) {
      const afterMood = moods.find(m => {
        const diff = new Date(m.createdAt) - new Date(meal.createdAt);
        return diff > 0 && diff < 1000 * 60 * 90;
      });
      if (!afterMood) continue;

      allData.push({
        mealSizeCode: mapPortionSize(meal.portionSize),
        hungerBefore: meal.hungerBefore,
        hungerAfter: meal.hungerAfter,
        mealType: meal.mealType,
        hourOfDay: new Date(meal.createdAt).getHours(),
        moodScore: afterMood.moodScore
      });
    }
  }

  fs.writeFileSync('./mealMoodData.json', JSON.stringify(allData, null, 2));
  console.log("✅ Export complete:", allData.length, "entries");
  process.exit();
}

run();