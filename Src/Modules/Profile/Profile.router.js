import express from "express";
import * as profileController from "./Profile.controller.js";
import { auth } from "../../Middleware/auth.js";
import { upload, uploadMiddleware } from "../../Middleware/imageUpload.js";

const app = express();

app.get("/", auth, profileController.getProfile);
app.get("/:playerId", profileController.getProfile);
app.post(
  "/create",
  auth,
  upload.single("image"),
  uploadMiddleware,
  profileController.createProfile
);

export default app;
