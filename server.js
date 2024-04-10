const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const localStrategy = require("./local-strategy");
const googleStrategy = require("./google-strategy");
const authRoute = require("./routes/auth");

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected successfully!");
  } catch (err) {
    console.log(err);
  }
};

// Middlewares
dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: "https://nasa-image-one.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Initialize passport strategies
localStrategy(passport);
googleStrategy(passport);

app.use("/api/auth", authRoute);

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`App is running on port ${process.env.PORT}`);
});
