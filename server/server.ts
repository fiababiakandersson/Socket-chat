import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, ServerSocketData } from "../types";
import { getRooms } from "./roomStore";
import registerChatHandler from './chatHandler';

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ServerSocketData>();

io.use((socket: Socket, next) => {
  const username: string = socket.handshake.auth.username;
  if (!username || username.length < 3) {
    return next(new Error('Invalid username'));
  }
  socket.data.username = username;
  next();
});

io.on("connection", (socket) => {
  console.log("a user connected");

  if (socket.data.username) {
    socket.emit("connected", socket.data.username);
    socket.emit('roomList', getRooms(io));
    //
  };

  registerChatHandler(io, socket)
  
});

io.listen(4000);

/**
 socket.emit("welcome", "Welcome to our chat app!");

  socket.on("chat message", (message) => {
    io.emit("chat message", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
 */