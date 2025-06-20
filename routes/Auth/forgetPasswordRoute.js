import express from 'express';
import { sendPasswordResetOTP } from '../../Controller/ForgetPassword/forgetPassword.js';
import { verifyPasswordResetOTP } from '../../Controller/ForgetPassword/verifyPasswordResetOTP.js';
import { setNewPassword } from '../../Controller/ForgetPassword/setNewPassword.js';

const router = express.Router();

// Request OTP for password reset
router.post('/forgot-password', sendPasswordResetOTP);

// Verify OTP for password reset
router.post('/verify-password-reset-otp', verifyPasswordResetOTP);

// Set new password after OTP verification
router.post('/set-new-password', setNewPassword);

export default router;