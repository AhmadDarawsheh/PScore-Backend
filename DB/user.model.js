import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
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
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      enum: ["user", "admin", "owner", "player", "manager"],
      default: "user",
    },
    birthDate: {
      type: Date,
    },
    gender: {
      type: String,
      default: "Male",
      enum: ["Male", "Female"],
    },
  },
  {
    timestamps: true,
  }
);

const userModel = model("User", userSchema);

export default userModel;
