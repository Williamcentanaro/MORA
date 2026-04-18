import express from "express";
import { register, login, getMe, updateMe, startGoogleAuth, handleGoogleCallback, startFacebookAuth, handleFacebookCallback, forgotPassword, resetPassword, verifyEmail } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);

// Classic Google OAuth Flow
router.get("/google", startGoogleAuth);
router.get("/google/callback", handleGoogleCallback);

// Classic Facebook OAuth Flow
router.get("/facebook", startFacebookAuth);
router.get("/facebook/callback", handleFacebookCallback);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);

export default router;