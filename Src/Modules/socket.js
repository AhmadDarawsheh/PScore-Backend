import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:8081", methods: ["GET", "POST"] },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const PORT = 4000;
const chatGroups = [];

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`${socket.id} joined room ${data}`);
  });

  socket.on("getAllGroups", () => {
    socket.emit("group_list", chatGroups);
  });

  socket.on("get_messages", (roomid) => {
    const groupExists = chatGroups.find(
      (group) => group.chatGroupName === roomid
    );
    if (groupExists) {
      console.log(groupExists.messages);
      setTimeout(() => {
        socket.emit("getRoomMasseges", groupExists.messages);
      }, 2000);
    } else {
      socket.emit("error", `Group with id ${roomid} not found`);
    }
  });

  socket.on("createNewGroup", (chatGroupName) => {
    const groupExists = chatGroups.some(
      (group) => group.chatGroupName === chatGroupName
    );
    if (groupExists) {
      socket.emit("error", `Group with name ${chatGroupName} already exists`);
    } else {
      console.log("createNewGroup", chatGroupName);
      chatGroups.unshift({
        id: chatGroups.length + 1,
        chatGroupName,
        messages: [],
      });
      socket.emit("group_list", chatGroups);
    }
  });

  socket.on("findGroup", (id) => {
    const filterGroup = chatGroups.filter((item) => item.chatGroupName == id);
    socket.emit("foudGroup", filterGroup[0].messages);
  });

  socket.on("newChatMassege", (data) => {
    const { currentMessage, currentMessageID, groupID, currentUser, date } =
      data;
    const filterGroup = chatGroups.filter(
      (item) => item.chatGroupName == groupID
    );
    const newMassege = {
      id: currentMessageID,
      groupID,
      currentUser,
      text: currentMessage,
      date: date,
    };

    socket.to(filterGroup[0].chatGroupName).emit("groupMassge", newMassege);
    filterGroup[0].messages.push(newMassege);
    socket.emit("group_list", chatGroups);
    socket.emit("faundGroup", filterGroup[0].messages);
  });

  socket.on("save_response", (MessageData) => {
    console.log("MessageData");
    console.log(MessageData);
  });

  socket.on("send_message", ({ MessageData, currentMessage }) => {
    console.log(currentMessage);
    const groupIndex = chatGroups.findIndex(
      (group) => group.chatGroupName === MessageData.room
    );

    chatGroups[groupIndex].messages.push(currentMessage);
    socket.to(MessageData.room).emit("receive_message", MessageData);
  });

  socket.on("disconnect", () => console.log("disconnected from", socket.id));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
