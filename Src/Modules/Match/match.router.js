import express from "express";
import { auth } from "../../Middleware/auth.js";
import * as matchController from "./match.controller.js";

const app = express();

app.post("/create", auth, matchController.createMatch);
app.get("/getemptymatch/:playgroundId/:date", matchController.getEmptyMatch);
app.get("/getmatch/:matchId", matchController.getEmptyMatch);

export default app;
