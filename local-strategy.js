const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./model/user");
const passport = require("passport");
module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Find the user by email
          const user = await User.findOne({ email });

          // If user not found, return false
          if (!user) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }

          // Compare the password with the hashed password
          const isMatch = await bcrypt.compare(password, user.password);

          // If the password doesn't match, return false
          if (!isMatch) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }

          // If everything is okay, return the user
          return done(null, user);
        } catch (err) {
          return done(err);
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
