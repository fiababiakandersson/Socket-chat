const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
app.use(express.static("public"));

const io = new Server(server);

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

server.listen(3000);
