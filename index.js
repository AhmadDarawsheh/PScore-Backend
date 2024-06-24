import express from "express";
import dotenv from 'dotenv';
dotenv.config();
const app = express();
import initApp from "./Src/Modules/init.app.js";

initApp(app, express);
