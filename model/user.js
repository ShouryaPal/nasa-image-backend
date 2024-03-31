const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      // Check if the password field is present or not
      return this.provider === "local";
    },
  },
  provider: {
    type: String,
    required: true,
    default: "local", // Default to local authentication
  },
});

module.exports = mongoose.model("User", userSchema);
