import express from "express";
import { auth } from "../../Middleware/auth.js";
import * as teamController from "./Team.controller.js";

const app = express();

app.post("/create", auth, teamController.createTeam);
app.get("/", teamController.getTeam);
app.get("/searchplayers", auth, teamController.searchPlayers);
app.post("/addplayer/:teamName/:playerId", auth, teamController.addPlayer);

export default app;
