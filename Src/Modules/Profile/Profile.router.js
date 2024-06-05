import express from "express";
import * as profileController from "./Profile.controller.js";
import { auth } from "../../Middleware/auth.js";

const app = express();

app.get("/", auth, profileController.getProfile);
app.get("/create", auth, profileController.createProfile);

export default app;
