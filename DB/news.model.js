import { Schema, model } from "mongoose";

const newsSchema = new Schema({
  publisher: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
  },
  desc: {
    type: String,
  },
  image: {
    type: String,
  },
  date: {
    type: String,
  },
});

const newsModel = model("News", newsSchema);

export default newsModel;
