import { Schema, model } from "mongoose";
const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      max: 100,
    },
    number: {
      type: String,
      max: 100,
    },
    country: {
      type: String,
      max: 100,
    },
    position: {
      type: String,
      max: 100,
    },
    image: {
      type: String,
      max: 500,
    },
    team: {
      type: String,
      max: 255,
    },
    goals: {
      type: Number,
      default: 0,
    },
    assists: {
      type: Number,
      default: 0,
    },
    trustLevel: {
      type: Number,
      default: 1,
    },
  },

  {
    timestamps: true,
  }
);

const profileModel = model("Profile", profileSchema);

export default profileModel;
