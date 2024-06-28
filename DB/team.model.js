import { Schema, model } from "mongoose";

const teamSchema = new Schema(
  {
    name: {
      type: String,
      max: 255,
      required: true,
      unique: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    image: {
      type: String,
      max: 500,
    },
    recentResults: [
      {
        type: String,
        enum: ["W", "L", "D"],
      },
    ],
  },
  { timestamps: true }
);

const teamModel = model("Team", teamSchema);

export default teamModel;
