import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import "./Src/Modules/cronJobs.js";
import initApp from "./Src/Modules/init.app.js";

import { initSocket } from "./Src/Modules/socket.js";
initSocket(app);

initApp(app, express);
