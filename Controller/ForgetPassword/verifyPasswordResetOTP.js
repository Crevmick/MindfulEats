import bcrypt from 'bcryptjs';
import User from '../../model/User.js';
import PasswordResetOTP from '../../model/PasswordResetOTP.js';

export const verifyPasswordResetOTP = async (req, res) => {
  const { email, otp } = req.body; // <-- require email and otp
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const otpDoc = await PasswordResetOTP.findOne({ userId: user._id });
  if (!otpDoc || otpDoc.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'OTP expired or not found.' });
  }

  const isMatch = await bcrypt.compare(otp, otpDoc.otp);
  if (!isMatch) return res.status(400).json({ message: 'Invalid OTP.' });

  res.json({ message: 'OTP verified. You can now reset your password.' });
};