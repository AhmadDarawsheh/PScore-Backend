import { Schema, model } from "mongoose";

const invitationScheam = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  reciver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  message: {
    type: String,
    max: 500,
  },

  match: {
    type: Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },
  image: {
    type: String,
  },
});

const invitationModel = model("Invitation", invitationScheam);

export default invitationModel;
