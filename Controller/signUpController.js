import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { check, validationResult } from 'express-validator';
import User from '../model/User.js';
import createToken from '../util/createToken.js';
import sendOTP from '../util/OTPsender.js';

// Validation rules for user registration
export const registerUserValidationRules = () => {
  return [
    check('fullName')
      .trim()
      .notEmpty().withMessage('Name is required.')
      .matches(/^[a-zA-Z ]*$/).withMessage('Name can only contain letters and spaces.')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
    check('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Invalid email address.')
      .normalizeEmail(),
    check('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  ];
};

// Controller to handle user registration
export const signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'FAILED', errors: errors.array() });
  }

  try {
    let { fullName, email, password } = req.body;

    fullName = fullName.trim();
    email = email.trim();
    password = password.trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ status: 'FAILED', errors: [{ msg: 'Email already exists!' }] });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Send OTP
    const otpResponse = await sendOTP({ _id: savedUser._id, email: savedUser.email });

    if (!otpResponse.success) {
      // Remove the user if OTP sending fails
      await User.findByIdAndDelete(savedUser._id);
      return res.status(500).json({
        status: 'FAILED',
        message: otpResponse.message || 'Failed to send OTP.',
      });
    }

    const token = await createToken(savedUser);

    return res.status(201).json({
      status: 'SUCCESS',
      message: 'Signup successful. OTP sent to email.',
      token,
      id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      verified: savedUser.verified,
      otpInfo: otpResponse.data,
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({
      status: 'FAILED',
      message: error.message || 'An error occurred while processing your request.',
    });
  }
};