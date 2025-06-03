import express from 'express';
import passport from '../../Config/passportConfig.js';

const router = express.Router();

// Route to display login link
router.get("/", (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
});

// Start Google OAuth flow
router.get(
  "/google",
  passport.authenticate('google', {
    scope: ["profile", "email"]
  })
);

// Callback route after Google authentication
router.get(
  "/google/callback",
  passport.authenticate('google', { failureRedirect: "/" }),
  (req, res) => {
    res.send(`Welcome ${req.user.displayName}`);
  }
);

// Logout route
router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

export default router;
