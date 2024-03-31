const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./model/user");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const passport = require("passport");
dotenv.config();

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.OAUTH_SECRET,
        callbackURL:
          "https://nasa-image-backend.onrender.com/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            // If user doesn't exist, create a new one
            user = new User({
              email: profile.emails[0].value,
              provider: "google",
              // Other fields...
            });
            await user.save();
          }

          // Sign JWT token
          const token = jwt.sign({ email: user.email }, process.env.SECRET, {
            expiresIn: "3d",
          });

          return done(null, { user, token });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
