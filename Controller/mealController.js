import cloudinary from '../utils/cloudinary.js';
import Meal from '../models/Meal.js';
import { detectFoodNameFromImage } from '../services/foodVision.js';
import { getFoodCategory } from '../Service/dietaryPatternService.js';
import { getPredictedMood } from '../Service/moodPredictionService.js';

export const uploadMeal = async (req, res) => {
  try {
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const uploaded = await cloudinary.uploader.upload(fileStr, { folder: 'meals' });
    const predictedFood = await detectFoodNameFromImage(uploaded.secure_url);
    const category = getFoodCategory(predictedFood);

    // Prepare data and get predicted mood BEFORE creating the meal document
    const mealInputForPrediction = {
        portionSize: req.body.portionSize, // String: "small", "medium", "large"
        hungerBefore: parseInt(req.body.hungerBefore), // Ensure these are numbers for the service
        hungerAfter: parseInt(req.body.hungerAfter),   // Ensure these are numbers for the service
        mealType: req.body.mealType,         // String: "breakfast", "lunch", etc.
        hourOfDay: new Date().getHours()     // Current hour
    };
    // console.log("Data for prediction model:", mealInputForPrediction); // For debugging
    const predictedMoodString = await getPredictedMood(mealInputForPrediction);
    // console.log("Predicted mood from service:", predictedMoodString); // For debugging

    const meal = await Meal.create({
      userId: req.user._id,
      portionSize: req.body.portionSize,
      mealType: req.body.mealType,
      hungerBefore: req.body.hungerBefore, // Mongoose will attempt to cast to Number based on schema
      hungerAfter: req.body.hungerAfter,   // Mongoose will attempt to cast to Number based on schema
      mealImage: uploaded.secure_url,
      predictedFoodName: predictedFood,
      foodCategory: category,
      moodLogId: req.body.moodLogId,
      predictedPostMealMood: predictedMoodString // Save the predicted mood
    });

    res.status(201).json({ success: true, meal });
  } catch (err) {
    console.error("Error in uploadMeal controller:", err); // Added server-side error logging
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
};
