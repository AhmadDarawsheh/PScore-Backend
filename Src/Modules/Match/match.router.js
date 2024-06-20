import express from "express";
import { auth } from "../../Middleware/auth.js";
import * as matchController from "./match.controller.js";

const app = express();

app.post("/create", auth, matchController.createMatch);

export default app;
