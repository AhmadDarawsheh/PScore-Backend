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
  goals: {
    type: Number,
    default: 0,
  },
  assists: {
    type: Number,
    default: 0,
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
    status: {
      type: String,
      enum: ["empty", "pending", "timed", "ended", "live"],
      default: "empty",
    },
    playgroundName: {
      type: String,
      max: 500,
    },
    playground: {
      type: Schema.Types.ObjectId,
      ref: "Playground",
      required: true,
    },
    team1Score: {
      type: Number,
      default: 0,
    },
    team2Score: {
      type: Number,
      default: 0,
    },
    events: [
      {
        goal: {
          type: String,
        },
        goalId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        assist: {
          type: String,
        },
        assistId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        time: {
          type: String,
        },
        team: {
          type: String,
        },
      },
    ],
    invitationExpiration: {
      type: Date,
    },
    invitationStatus: {
      type: String,
      enum: ["pending", "expired", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const matchModel = model("Match", matchSchema);

export default matchModel;
