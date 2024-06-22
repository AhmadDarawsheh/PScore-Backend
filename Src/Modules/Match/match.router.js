import express from "express";
import { auth } from "../../Middleware/auth.js";
import * as matchController from "./match.controller.js";

const app = express();

app.post("/create", auth, matchController.createMatch);
app.get("/getemptymatch/:playgroundId", matchController.getEmptyMatch);

export default app;
