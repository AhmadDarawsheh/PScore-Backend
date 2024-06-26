import express from "express";
import { auth } from "../../Middleware/auth.js";
import { upload, uploadMiddleware } from "../../Middleware/imageUpload.js";
import * as newsController from "./news.controller.js";

const app = express();

app.post(
  "/create",
  auth,
  upload.single("image"),
  uploadMiddleware,
  newsController.createNews
);
app.get("/", newsController.getNews);

export default app;
