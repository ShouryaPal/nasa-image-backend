const express = require("express");
const router = express.Router();
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("../local-strategy")(passport); // Import local strategy
require("../google-strategy")(passport); // Import Google strategy

// Local Authentication Routes

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const newUser = new User({ email, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json(info);
    }

    // Sign a JWT token and send it back to the client
    const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "3d",
    });
    res.cookie("token", token).status(200).json(info);
  })(req, res, next);
});

// Google Authentication Routes

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "https://nasa-image-one.vercel.app" }),
  (req, res) => {
    const token = req.user.token;
    res
      .cookie("token", token)
      .status(200)
      .redirect("https://nasa-image-one.vercel.app");
  }
);

router.get("/refetch", (req, res) => {
  const token = req.headers.authorization || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.SECRET, {}, async (err, data) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // If token is valid, return user data
    const user = await User.findById(data.userId);
    res.status(200).json(user);
  });
});

module.exports = router;
