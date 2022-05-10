import { Server, Socket } from 'socket.io';
import { getRooms } from './roomStore';

export default (io: Server, socket: Socket) => {

    socket.on("join", (room) => {
     const shouldBroadcastRooms: boolean = !getRooms(io).includes(room);
      
     // leave room while entering a new one
      socket.rooms.forEach((room) => {
        if (socket.id !== room) {
          socket.leave(room);
        }
      });

      socket.join(room);
       if (true) {
        io.emit("roomList", getRooms(io));
      }
      socket.emit("joined", room);
    });

     socket.on("leave", (room) => {
       console.log('lämnat', room)
       socket.leave(room);
       socket.emit('userLeft', room)
      io.emit("roomList", getRooms(io))
    }) 

    socket.on("message", (message, to) => {

      if (!socket.data.username) {
        return socket.emit("_error", "Missing username");
      }

      io.to(to).emit("message", message, {
        id: socket.id,
        username: socket.data.username,
      }); 
    });

    /* if socket is typing or not */
    socket.on('typing', () =>{
    socket.broadcast.emit('typing', socket.data.username);
   })

   socket.on('nottyping', () =>{
    socket.broadcast.emit('nottyping', socket.data.username);
   }) 

   socket.on("disconnect", () => {
    console.log(socket.data.username, " disconnected");
  });
}