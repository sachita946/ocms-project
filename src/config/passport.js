import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// ------------------ GOOGLE STRATEGY ------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackURL: "/api/oauth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        return done(null, profile);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ------------------ FACEBOOK STRATEGY ------------------
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
      callbackURL: "/api/oauth/facebook/callback",
      profileFields: ["id", "emails", "name", "displayName"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        return done(null, profile);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize and deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
