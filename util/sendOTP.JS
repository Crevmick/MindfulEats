import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import UserOTPVerification from '.././src/model/UserOTPVerification.js';

// Set up transporter once
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS
  }
});

const sendOTP = async ({ _id, email }) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify your Email",
      html: `<p>Enter <b>${otp}</b> to verify your email address and complete your registration.</p><p>This code <b>expires in 1 hour</b>.</p>`,
    };

    const hashedOTP = await bcrypt.hash(otp, 10);

    const newOTPVerification = new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Verification OTP email sent",
      data: { userId: _id, email },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export default sendOTP;
