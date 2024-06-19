import { Schema, model } from "mongoose";
const ownerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    playgrounds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playground",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ownerModel = model("Owner", ownerSchema);

export default ownerModel;
