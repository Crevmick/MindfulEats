import User from '../model/User.js';
import bcrypt from 'bcrypt';
import createToken from '../util/createToken.js';

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = createToken(user);

    // Respond with token and user info (omit password)
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({
      message: 'Sign in successful.',
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};