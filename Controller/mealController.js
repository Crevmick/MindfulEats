import cloudinary from '../utils/cloudinary.js';
import Meal from '../models/Meal.js';
import { detectFoodNameFromImage } from '../services/foodVision.js';
import { getFoodCategory } from '../Service/dietaryPatternService.js';

export const uploadMeal = async (req, res) => {
  try {
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const uploaded = await cloudinary.uploader.upload(fileStr, { folder: 'meals' });
    const predictedFood = await detectFoodNameFromImage(uploaded.secure_url);
    const category = getFoodCategory(predictedFood);

    const meal = await Meal.create({
      userId: req.user._id,
      portionSize: req.body.portionSize,
      mealType: req.body.mealType,
      hungerBefore: req.body.hungerBefore,
      hungerAfter: req.body.hungerAfter,
      mealImage: uploaded.secure_url,
      predictedFoodName: predictedFood,
      foodCategory: category
    });

    res.status(201).json({ success: true, meal });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
};
