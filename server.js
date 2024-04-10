const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("cookie-session"); 
const localStrategy = require("./local-strategy");
const googleStrategy = require("./google-strategy");
const authRoute = require("./routes/auth");

//database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("database is connected successfully!");
  } catch (err) {
    console.log(err);
  }
};

//middlewares
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
    keys: process.env.SESSION_SECRET || process.env.SECRET,
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use(passport.initialize());
app.use(passport.session());
localStrategy(passport);
googleStrategy(passport);

app.use("/api/auth", authRoute);

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`app is running on port ${process.env.PORT}`);
});
