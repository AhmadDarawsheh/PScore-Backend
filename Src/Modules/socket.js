import http from "http";
import { Server } from "socket.io";

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

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    server.listen(4000, () => {
      console.log(`Socket.io server running on port 4000`);
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
