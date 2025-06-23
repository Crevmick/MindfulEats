import express from 'express';
import User from '../../model/User.js';
import authenticateUser from '../../middleware/authenticateUser.js';

const router = express.Router();

router.get('/', authenticateUser, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
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

router.patch('/update-profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get fields user wants to update
    const { fullName, email } = req.body;

    // Find the user
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update allowed fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;