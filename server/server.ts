import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ServerSocketData,
} from "../types";
import { getRooms } from "./roomStore";
import registerChatHandler from "./chatHandler";

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  ServerSocketData
>();

io.use((socket: Socket, next) => {
  const username: string = socket.handshake.auth.username;
  socket.data.username = username;
  next();
});
io.on("connection", (socket) => {
  console.log("a user connected");

  if (socket.data.username) {
    socket.emit("connected", socket.data.username);
    console.log("connected:", socket.data.username, socket.id);
    socket.emit("roomList", getRooms(io));
  }
  registerChatHandler(io, socket);
});

io.listen(4000);
