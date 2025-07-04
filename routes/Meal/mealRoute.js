import express from 'express';
import { uploadMeal } from '../../Controller/mealController.js';
import authenticateUser from '../../middleware/authenticateUser.js';
import { upload } from '../../middleware/multerConfig.js'; 

const router = express.Router();

// @route   POST /api/meals/upload
// @desc    Upload a meal image and associated data, then analyze it
router.post('/upload', authenticateUser, upload.single('image'), uploadMeal);

export default router;