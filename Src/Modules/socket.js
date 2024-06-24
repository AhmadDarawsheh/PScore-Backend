import http from 'http';
import { Server } from 'socket.io';

let io; 

export const initSocket = (app) => {
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on('connection', socket => {
    console.log('A user connected');


    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  server.listen(4000, () => {
    console.log(`Socket.io server running on port ${4000}`);
  });

  return io;
};

export const getIo = () => io; // Export function to get io instance
