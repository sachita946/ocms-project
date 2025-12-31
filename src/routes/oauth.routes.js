import { Router } from "express";
import passport from "passport";
import { googleAuthSuccess, facebookAuthSuccess } from "../controllers/oauth.controller.js";

const router = Router();

// GOOGLE
router.get('/google', passport.authenticate("google", { scope: ["email", "profile"] }));
router.get('/google/callback',
  passport.authenticate("google", { failureRedirect: "/auth/login.html?error=oauth_failed" }),
  googleAuthSuccess
);

// FACEBOOK
router.get('/facebook', passport.authenticate("facebook", { scope: ["email"] }));
router.get('/facebook/callback',
  passport.authenticate("facebook", { failureRedirect: "/auth/login.html?error=oauth_failed" }),
  facebookAuthSuccess
);

export default router;
