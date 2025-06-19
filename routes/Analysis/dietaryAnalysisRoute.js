import express from 'express';
import { getDietaryAnalysis } from '../../Controller/analysisController.js';
import authenticateUser from '../../middleware/authenticateUser.js'; // Path based on ls output

const router = express.Router();

// @route   GET /api/dietary-analysis/
// @desc    Get dietary patterns, insights, and recommendations for the logged-in user
// @access  Private
router.get('/', authenticateUser, getDietaryAnalysis);

export default router;
