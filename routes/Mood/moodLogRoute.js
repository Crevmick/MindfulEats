import express from 'express';
import { createMoodLog, getAllMoodLogs, getMoodLogsByUser } from '../../Controller/moodLogController.js';
import authenticateUser from '../../middleware/authenticateUser.js';


const router = express.Router();

router.post('/', authenticateUser, createMoodLog); //This help to Create a mood log
router.get('/', authenticateUser, getAllMoodLogs); //This help to Get all mood logs
router.get('/user', authenticateUser, getMoodLogsByUser); // Get mood logs by user

export default router;