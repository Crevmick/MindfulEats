import cloudinary from '../util/cloudinary.js';
import Meal from '../model/mealLog.js';
import { detectFoodNameFromImage } from '../Service/foodVision.js';
import { getFoodCategory } from '../Service/dietaryPatternService.js';
import { getPredictedMood } from '../Service/moodPredictionService.js';

export const uploadMeal = async (req, res) => {
  try {
    // Check if the file and user are present
    if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
    }
    if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated.' });
    }

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const uploaded = await cloudinary.uploader.upload(fileStr, { folder: 'meals' });
    const predictedFood = await detectFoodNameFromImage(uploaded.secure_url);
    const category = await getFoodCategory(predictedFood);

    

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
      hungerBefore: mealInputForPrediction.hungerBefore, 
      hungerAfter: mealInputForPrediction.hungerAfter, 
      mealImage: uploaded.secure_url,  
      predictedFoodName: predictedFood,
      foodCategory: category,
      moodLogId: req.body.moodLogId,
      predictedPostMealMood: predictedMoodString // Save the predicted mood
    });

    res.status(201).json({ success: true, meal });
  } catch (err) {
    console.error("Error in uploadMeal controller:", err); 
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
};
