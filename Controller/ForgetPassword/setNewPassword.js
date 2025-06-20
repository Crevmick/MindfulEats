import bcrypt from 'bcryptjs';
import User from '../../model/User.js';
import PasswordResetOTP from '../../model/PasswordResetOTP.js';

export const setNewPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  await PasswordResetOTP.deleteMany({ userId: user._id });

  res.json({ message: 'Password reset successful.' });
};