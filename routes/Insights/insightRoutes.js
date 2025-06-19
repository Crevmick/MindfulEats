import express from 'express';
import { getIntegratedDietaryInsights } from '../../Controller/analysisController.js';
import authenticateUser from '../../middleware/authenticateUser.js';

const router = express.Router();

// @route   GET /api/insights/dietary
// @desc    Get integrated dietary patterns, insights, and recommendations for the logged-in user
// @access  Private
router.get('/dietary', authenticateUser, getIntegratedDietaryInsights);

export default router;
