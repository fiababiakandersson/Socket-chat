import { Server, Socket } from 'socket.io';
import { getRooms } from './roomStore';

export default (io: Server, socket: Socket) => {

    socket.on("join", (room) => {
      const shouldBroadcastRooms: boolean = !getRooms(io).includes(room);
      
      // socket.leave function som berättar om användaren har lämnat ett rum eller inte.
      
      socket.join(room);
      if (true) {
        io.emit("roomList", getRooms(io));
      }
      console.log(io.sockets.adapter.rooms)
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

    socket.on('typing', () =>{
    socket.broadcast.emit('typing', socket.data.username);
   })

   socket.on('nottyping', () =>{
    socket.broadcast.emit('nottyping', socket.data.username);
   }) 
}