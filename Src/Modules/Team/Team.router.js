import express from "express";
import { auth } from "../../Middleware/auth.js";
import * as teamController from "./Team.controller.js";
import { upload, uploadMiddleware } from "../../Middleware/imageUpload.js";

const app = express();

app.post(
  "/create",
  auth,
  upload.single("image"),
  uploadMiddleware,
  teamController.createTeam
);
app.get("/", auth, teamController.getTeam);
app.get("/searchplayers", auth, teamController.searchPlayers);
app.post("/addplayer/:playerId", auth, teamController.addPlayer);
app.delete("/removeplayer/:playerId", auth, teamController.removePlayer);
app.post("/joinmatch/:matchId", auth, teamController.addMyTeam);

export default app;
