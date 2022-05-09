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
      console.log(io.sockets.adapter.rooms)
      socket.emit("joined", room);
      console.log('har joinat', room)
    });



     socket.on("leave", (room) => {
       console.log('lämnat', room)
       socket.leave(room);
       socket.emit('userLeft', room)
      io.emit("roomList", getRooms(io))
    }) 


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

   //socket.on('addRoom', (room) => {
     //console.log(room)
    // const shouldBroadcastRooms: boolean = !getRooms(io).includes(room);
     //io.emit("roomList", getRooms(io))
    //  if (true) {
    //    io.emit("roomList", room, getAddedRooms(io)); //ska göras innan joinar
     // } 
  // })


   //hm oklar
  /*  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("user has left", socket.id);
      }
    }
  }); */
}