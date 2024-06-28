import { Schema, model } from "mongoose";

const reportSchema = new Schema(
  {
    fan: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    goaler: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    assister: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    team: {
      type: String,
    },

    match: {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
    time: {
      type: String,
    },
  },
  { timestamps: true }
);

const reportModel = model("Report", reportSchema);

export default reportModel;
