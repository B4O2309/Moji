import express from 'express';
import { signUp, signIn, signOut, refreshToken, forgotPassword, verifyOtp, resetPassword, googleCallback, deleteAccount, getSessions
, revokeSession, revokeAllSessions
 } from '../controllers/authController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import passport from 'passport';

const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn)

router.post("/signout", signOut);

router.post("/refresh", refreshToken);

router.post("/forgot-password", forgotPassword); 

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword); 

router.delete("/delete-account", protectedRoute, deleteAccount);

// Session management
router.get("/sessions", protectedRoute, getSessions);
router.delete("/sessions/:sessionId", protectedRoute, revokeSession);
router.delete("/sessions", protectedRoute, revokeAllSessions);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/signin" }), googleCallback);

export default router;