import MoodLog from '../model/moodLog.js';

// Create a new mood log
export const createMoodLog = async (req, res) => {
  try {
    const { userId, moodScore, reasonText } = req.body;
    const moodLog = new MoodLog({ userId, moodScore, reasonText });
    await moodLog.save();
    res.status(201).json(moodLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// This help to Get all mood logs
export const getAllMoodLogs = async (req, res) => {
  try {
    const moodLogs = await MoodLog.find().populate('userId', 'name email');
    res.json(moodLogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//This help to get mood logs by user
export const getMoodLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const moodLogs = await MoodLog.find({ userId }).sort({ createdAt: -1 });
    res.json(moodLogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};