import { Server, Socket } from 'socket.io';
import { getRooms } from './roomStore';

export default (io: Server, socket: Socket) => {

    socket.on("join", (room) => {
      const shouldBroadcastRooms: boolean = !getRooms(io).includes(room);

      socket.join(room);

      if (shouldBroadcastRooms) {
        io.emit("roomList", getRooms(io));
      }
      socket.emit("joined", room);
    });

    socket.on("message", (message, to) => {
      console.log(message, to);

      if (!socket.data.username) {
        return socket.emit("_error", "Missing username");
      }

      io.to(to).emit("message", message, {
        id: socket.id,
        username: socket.data.username,
      }); //socket.id för privat chat
    });

}