import { Schema, model } from "mongoose";

const playerSchema = new Schema({
  playerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
});

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
    team1Players: [playerSchema],
    team1others: {
      type: [
        {
          playerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
          photo: String,
        },
      ],
      default: [],
    },
    team2: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    team2Players: [playerSchema],
    team2others: {
      type: [
        {
          playerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
          photo: String,
        },
      ],
      default: [],
    },
    invitedTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    invitedTeamResponse: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      default: "pending",
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
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

matchSchema.index(
  { "location.coordinates": 1, date: 1, time: 1 },
  { unique: true }
);

const matchModel = model("Match", matchSchema);

export default matchModel;
