import mongoose from 'mongoose';

const PasswordResetOTPSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model('PasswordResetOTP', PasswordResetOTPSchema);