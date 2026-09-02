import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

     addresses: [{
    label: { type: String, default: 'Home' },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true }
  }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
