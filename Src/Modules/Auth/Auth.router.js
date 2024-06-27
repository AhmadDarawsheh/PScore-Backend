import express from "express";
const app = express();
import * as AuthController from "./Auth.controller.js";

app.post("/signup", AuthController.signup);
app.post("/signin", AuthController.signin);
app.get("/getuser/:email", AuthController.getByEmail);

export default app;
