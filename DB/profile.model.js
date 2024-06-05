import { Schema, model } from "mongoose";
const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  },

  {
    timestamps: true,
  }
);

const profileModel = model("Profile", profileSchema);

export default profileModel;
