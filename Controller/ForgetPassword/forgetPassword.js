import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../../model/User.js';
import PasswordResetOTP from '../../model/PasswordResetOTP.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS
  }
});

export const sendPasswordResetOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  // Generate OTP
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  const hashedOTP = await bcrypt.hash(otp, 10);

  // Save OTP to DB (remove old ones first)
  await PasswordResetOTP.deleteMany({ userId: user._id });
  const otpDoc = new PasswordResetOTP({
    userId: user._id,
    otp: hashedOTP,
    expiresAt: Date.now() + 3600000 // 1 hour
  });
  await otpDoc.save();

  // Send OTP email
  await transporter.sendMail({
    to: email,
    subject: 'Password Reset OTP',
    html: `<p>Your password reset OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`
  });

  res.json({ message: 'Password reset OTP sent to email.' });
};