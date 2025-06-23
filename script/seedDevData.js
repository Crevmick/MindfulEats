import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; 
import User from '../model/User.js';
import MoodLog from '../model/moodLog.js';
import MealLog from '../model/mealLog.js';
import { getFoodCategory } from '../Service/dietaryPatternService.js';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const connectDB = async () => {
  try {
    if (!MONGODB_URL) {
      console.error("Error: MONGODB_URL is not defined in your .env file.");
      process.exit(1);
    }
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected successfully for seeding.");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected successfully.");
  } catch (err) {
    console.error("MongoDB disconnection error:", err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    console.log("Clearing old data...");
    try {
      await User.deleteMany({});
      console.log("Users cleared.");
      await MoodLog.deleteMany({});
      console.log("MoodLogs cleared.");
      await MealLog.deleteMany({});
      console.log("MealLogs cleared.");
    } catch (err) {
      console.error("Error clearing data:", err);
      throw err;
    }

    console.log("Creating users...");
    const saltRounds = 10;
    const usersData = [
      { fullName: "Admin User", email: "admin@example.com", password: "adminpassword", verified: true },
      { fullName: "Regular User", email: "user@example.com", password: "userpassword", verified: true },
    ];

    const createdUsers = [];
    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const user = new User({ ...userData, password: hashedPassword });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`User ${savedUser.email} created successfully.`);
    }

    console.log("Creating mood logs...");
    const moodScores = ['Frustrated', 'Sad', 'Happy', 'Anxious', 'Grateful', 'Neutral'];
    const sampleReasons = {
      Happy: ["Had a great day!", "Feeling productive.", "Enjoyed time with friends."],
      Sad: ["Feeling a bit down.", "Missing someone.", "Work was stressful."],
      Frustrated: ["Things didn't go as planned.", "Stuck in traffic.", "Tech issues."],
      Anxious: ["Big presentation tomorrow.", "Worried about deadlines.", "Feeling overwhelmed."],
      Grateful: ["Appreciative of my health.", "Thankful for support.", "Good news today."],
      Neutral: ["Just a regular day.", "Feeling calm.", "Nothing much to report."]
    };

    const moodLogs = [];
    for (const user of createdUsers) {
      for (let i = 0; i < 14; i++) {
        const randomMood = moodScores[Math.floor(Math.random() * moodScores.length)];
        const randomReason = sampleReasons[randomMood][Math.floor(Math.random() * sampleReasons[randomMood].length)];
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - (6 - i));

        const moodLog = new MoodLog({
          userId: user._id,
          moodScore: randomMood,
          reasonText: randomReason,
          createdAt: logDate,
        });
        const savedMoodLog = await moodLog.save();
        moodLogs.push(savedMoodLog);
      }
    }
    console.log(`${moodLogs.length} mood logs created successfully.`);

    console.log("Creating meal logs...");
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const sampleFoods = {
      breakfast: ["Oatmeal with fruits", "Eggs and toast", "Cereal with milk", "Smoothie"],
      lunch: ["Chicken salad sandwich", "Vegetable stir-fry", "Lentil soup", "Quinoa bowl"],
      dinner: ["Salmon with roasted vegetables", "Pasta with marinara sauce", "Chicken curry with rice", "Tofu scramble"],
      snack: ["Apple slices with peanut butter", "Yogurt", "Handful of nuts", "Rice cakes"]
    };

    const mealImages = {
  "Oatmeal with fruits": "https://images.unsplash.com/photo-1702648982253-8b851013e81f?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB4MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Sweet potato": "https://plus.unsplash.com/premium_photo-1713088501689-517b74d9a68b?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Eggs and toast": "http://images.unsplash.com/photo-1684248182033-3777c303f726?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Cereal with milk": "https://plus.unsplash.com/premium_photo-1695166772873-76e14fdf748c?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Smoothie": "https://plus.unsplash.com/premium_photo-1663126827264-409d695e0be7?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Chicken salad sandwich": "https://images.unsplash.com/photo-1666819604716-7b60a604bb76?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Vegetable stir-fry": "https://plus.unsplash.com/premium_photo-1664475934279-2631a25c42ce?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Lentil soup": "https://images.unsplash.com/photo-1607530689445-5d9c240989f6?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Quinoa bowl": "https://images.unsplash.com/photo-1557022064-96940a435850?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Salmon with roasted vegetables": "https://images.unsplash.com/photo-1616738988647-75e927c9e13d?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Pasta with marinara sauce": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Chicken curry with rice": "https://images.unsplash.com/photo-1634739462744-8d9600129a1b?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Tofu scramble": "https://images.unsplash.com/photo-1606766442436-128a38a798b3?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Apple slices with peanut butter": "https://images.unsplash.com/photo-1597813295843-c0d1e5d7c4b4?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Yogurt": "https://images.unsplash.com/photo-1564149503905-7fef56abc1f2?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Handful of nuts": "https://images.unsplash.com/photo-1611762111585-7033a59333a3?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Rice cakes": "https://images.unsplash.com/photo-1605372439130-9b4b0e5c94d0?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
};
    const fallbackImage = "https://images.unsplash.com/photo-1605372439130-9b4b0e5c94d0?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";


    const mealLogs = [];
    for (const user of createdUsers) {
      const userMoodLogs = moodLogs.filter(ml => ml.userId.equals(user._id)).sort((a, b) => a.createdAt - b.createdAt);

      for (let i = 0; i < 7; i++) {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - (6 - i));

        const numMealsToday = Math.floor(Math.random() * 2) + 2;
        const dayMealTypes = [...mealTypes].sort(() => 0.5 - Math.random()).slice(0, numMealsToday);

        for (const mealType of dayMealTypes) {
          const randomFood = sampleFoods[mealType][Math.floor(Math.random() * sampleFoods[mealType].length)];
          const hungerBefore = Math.floor(Math.random() * 7) + 3;
          const hungerAfter = Math.floor(Math.random() * (hungerBefore - 1)) + 1;
          const moodLogForThisDay = userMoodLogs.find(ml =>
            ml.createdAt.getFullYear() === logDate.getFullYear() &&
            ml.createdAt.getMonth() === logDate.getMonth() &&
            ml.createdAt.getDate() === logDate.getDate()
          );

          const shouldLinkMoodLog = moodLogForThisDay && Math.random() > 0.5;

          const mealLog = new MealLog({
            userId: user._id,
            foodName: randomFood,
            portionSize: "Medium",
            foodCategory: getFoodCategory(randomFood),
            mealType: mealType,
            hungerBefore: hungerBefore,
            hungerAfter: hungerAfter,
            notes: `Enjoyed this ${mealType}.`,
            mealImage: mealImages[randomFood] || fallbackImage,
            predictedFoodName: randomFood,
            createdAt: new Date(
              logDate.getFullYear(),
              logDate.getMonth(),
              logDate.getDate(),
              mealType === 'breakfast' ? 8 : mealType === 'lunch' ? 13 : mealType === 'dinner' ? 19 : 16
            ),
            moodLogId: shouldLinkMoodLog ? moodLogForThisDay._id : null,
            mealImage: mealImages[randomFood] || fallbackImage,
          });

          const savedMealLog = await mealLog.save();
          mealLogs.push(savedMealLog);
        }
      }
    }

    console.log(`${mealLogs.length} meal logs created successfully.`);
    console.log("Data seeding completed successfully.");

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await disconnectDB();
  }
};

seedData();
