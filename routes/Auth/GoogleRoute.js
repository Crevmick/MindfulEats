import express from 'express';
import passport from '../../Config/passportConfig,js';

const router = express.Router();

// Route to start Google OAuth authentication
router.get("/", (req, res) => {
    res.send("<a href='/auth/google'>Login with Google<a>")
});

router.get("/google", passport.authenticate('google', {scope: ["Profile", "email"]} ))

router.get("/google/callback", passport.authenticate('google', {failureRedirect: "/" }), (req, res) => {
    res.send(`Welcome ${req.user.displayName}`);
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/")
})

export default router;