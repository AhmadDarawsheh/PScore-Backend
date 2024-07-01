import { Schema, model } from "mongoose";

const playerInvitationScheam = new Schema({
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
  image: {
    type: String,
  },
});

const playerInvitationModel = model("PInvitation", playerInvitationScheam);

export default playerInvitationModel;
