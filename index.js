import express from "express";
import dotenv from "dotenv";
dotenv.config();
import initApp from "./Src/Modules/init.app.js";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const PORT = 4000;
const chatGroups = [];

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("hello", () => {
    console.log("Hi Nigga");
  });

  socket.on("disconnect", () => console.log("disconnected from", socket.id));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

initApp(app, express);

app.listen(3000, () => {
  console.log("listening on port 3000");
});
