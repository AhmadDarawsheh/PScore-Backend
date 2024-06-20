import { Schema, model } from "mongoose";

const matchSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team1: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    team2: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["empty", "pending", "timed"],
      default: "empty",
    },
  },
  { timestamps: true }
);

matchSchema.index({ "location.coordinates": 1, date: 1, time: 1 }, { unique: true });

const matchModel = model("Match", matchSchema);

export default matchModel;
