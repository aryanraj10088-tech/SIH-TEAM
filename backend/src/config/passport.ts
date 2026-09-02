import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL?.trim();

if (!googleClientId || !googleClientSecret || !googleCallbackUrl) {
  console.warn('Google OAuth is not configured. Skipping Passport strategy setup.');
} else {
  /**
   * Google OAuth 2.0 Strategy for SrijanSetu
   *
   * Required env vars:
   *   GOOGLE_CLIENT_ID
   *   GOOGLE_CLIENT_SECRET
   *   GOOGLE_CALLBACK_URL  → http://localhost:5000/api/auth/google/callback  (dev)
   *                          https://sih-team-ai.onrender.com/api/auth/google/callback (prod)
   */
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || 'Google User';
          const googleId = profile.id;

          if (!email) {
            return done(new Error('No email returned from Google'), undefined);
          }

          // 1. Try finding existing user by googleId (returning Google user)
          let user = await User.findOne({ googleId });

          if (!user) {
            // 2. Try finding by email (may have signed up with email/password before)
            user = await User.findOne({ email });

            if (user) {
              // Link their Google account to the existing local account
              user.googleId = googleId;
              user.authProvider = 'google';
              user.isEmailVerified = true;
              user.accountStatus = 'ACTIVE';
              await user.save();
            } else {
              // 3. Brand-new user — create account instantly (no OTP needed for Google)
              user = await User.create({
                name,
                email,
                passwordHash: '',        // No password for Google users
                googleId,
                authProvider: 'google',
                isEmailVerified: true,   // Google already verified the email
                accountStatus: 'ACTIVE', // Active immediately
                role: 'Operator',        // Default role; admin can change via dashboard
                accountType: 'INDIVIDUAL',
                otpAttempts: 0,
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
}

// Stateless JWT — serialize/deserialize are required by passport but not used for sessions
passport.serializeUser((user: any, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
