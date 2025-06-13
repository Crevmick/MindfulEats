import mongoose from 'mongoose';

const UserOTPVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // expires in 10 minutes
});

const UserOTPVerification = mongoose.model('UserOTPVerification', UserOTPVerificationSchema);

export default UserOTPVerification;