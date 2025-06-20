import bcrypt from 'bcryptjs';
import User from '../model/User.js';
import UserOTPVerification from '../model/UserOTPVerification.js';
import createToken from '../util/createToken.js';
import sendOTP from '../util/OTPsender.js';

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) throw new Error("OTP details are required");

    const otpRecords = await UserOTPVerification.find({ userId });
    if (otpRecords.length === 0) throw new Error("Account record not found or already verified. Please sign up again.");

    const { expiresAt, otp: hashedOTP } = otpRecords[0];
    if (expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({ userId });
      throw new Error("Code has expired. Please request again");
    }

    const validOTP = await bcrypt.compare(otp, hashedOTP);
    if (!validOTP) throw new Error("Invalid code passed");

    await User.updateOne({ _id: userId }, { verified: true });
    await UserOTPVerification.deleteMany({ userId });

    const user = await User.findById(userId);
    const token = await createToken({ userId: user._id });

    res.json({
      status: "VERIFIED",
      message: "User email verified successfully",
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

export const resendOTPVerificationCode = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) throw new Error("Empty user detail not allowed");

    await UserOTPVerification.deleteMany({ userId });
    const response = await sendOTP({ email, userId });

    res.json({
      status: "SUCCESS",
      message: "OTP resent successfully",
      data: response.data,
    });
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};