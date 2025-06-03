import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../model/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

// Passport Google OAuth strategy with JWT token generation
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'] 
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Extract profile information from Google
        const { id, emails, displayName, photos } = profile;

        // Try to find the user by Google ID
        let user = await User.findOne({ googleId: id });

        if (!user) {
            // If the user does not exist, create a new user
            user = new User({
                googleId: id,
                email: emails[0].value,
                name: displayName,
                profilePicture: photos[0].value, // Optional: Save profile picture
                verified: true,  // Google users are typically verified
                accessToken: accessToken, // Save access token (if i need it for future API calls)
                refreshToken: refreshToken
            });
            await user.save(); // Save the new user in the database
        }

        // Generate a JWT token for the authenticated user
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,  // Use your JWT secret
            { expiresIn: '1h' }  // Token expires in 1 hour
        );

        // Return the user data and JWT token
        done(null, { user, token });
    } catch (error) {
        done(error, null);  // Handle any errors
    }
}));

export default passport;