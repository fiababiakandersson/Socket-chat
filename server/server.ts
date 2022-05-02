import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, ServerSocketData } from "../types";

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ServerSocketData>();

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.emit("welcome", "Welcome to our chat app!");

  socket.on("chat message", (message) => {
    io.emit("chat message", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

io.listen(4000);
