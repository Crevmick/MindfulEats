import express from 'express';
import { verifyOTP, resendOTPVerificationCode } from '../../Controller/otpController.js';

const router = express.Router();

router.post('/verifyOTP', verifyOTP);
router.post('/resendOTPVerificationCode', resendOTPVerificationCode);

export default router;