import express from "express";
import { auth } from "../../Middleware/auth.js";
import { upload, uploadMiddleware } from "../../Middleware/multiImageUpload.js"
import * as playgroundController from "./Playground.controller.js";

const app = express();


app.post(
  "/admin/addPlayground",
  auth,
  upload,
  uploadMiddleware,
  playgroundController.addPlayground
);

export default app;
