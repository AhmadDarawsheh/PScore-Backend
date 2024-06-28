import { Schema, model } from "mongoose";

const playgroundSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    photos: [
      {
        type: String,
      },
    ],
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
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
playgroundSchema.index({ location: "2dsphere" });

const playgroundModel = model("Playground", playgroundSchema);

export default playgroundModel;
