const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("./model/user");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      ExtractJwt.fromUrlQueryParameter("token"),
      (req) => {
        let token = null;
        if (req?.cookies) {
          token = req.cookies.token;
        }
        return token;
      },
    ]),
    secretOrKey: process.env.SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.userId);
        if (user) {
          return done(null, user);
        }
          return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};