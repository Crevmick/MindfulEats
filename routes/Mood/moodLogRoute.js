import express from 'express';
import { createMoodLog, getAllMoodLogs, getMoodLogsByUser } from '../../Controller/moodLogController.js';

const router = express.Router();

router.post('/', createMoodLog); //This help to Create a mood log
router.get('/', getAllMoodLogs); //This help to Get all mood logs
router.get('/user/:userId', getMoodLogsByUser); // Get mood logs by user

export default router;