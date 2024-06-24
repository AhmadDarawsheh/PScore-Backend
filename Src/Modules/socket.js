import http from "http";
import { Server } from "socket.io";
import matchModel from "../../DB/match.model.js";

let io;

export const initSocket = (app) => {
  if (!io) {
    const server = http.createServer(app);

    io = new Server(server, {
      cors: {
        origin: "*", // Adjust this based on your frontend URL
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("A user connected", socket.id);

      socket.on("hello", () => {
        console.log("Received hello from client");
        // Example: Emitting back to the client
        io.emit("hi", { message: "Hello from the server!" });
      });

      socket.on("getMatch", async (matchId) => {
        const match = await matchModel.findById(matchId);
        if (!match) return io.emit("foundmatch", { message: "No match found" });

        setInterval(() => {
          io.emit("foundmatch", { match });
        }, 10000);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    server.listen(3000, () => {
      console.log(`Socket.io server running on port 3000`);
    });
  }

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
