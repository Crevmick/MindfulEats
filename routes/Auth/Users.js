import express from 'express';
import User from '../../model/User.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
    res.status(400).json({ message: "You need to login" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    res.status(200).json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;