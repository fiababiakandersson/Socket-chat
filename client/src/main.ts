import './style/nameForm.css';
import './style/roomMenu.css';
import "./style/roomList.css";

import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../../types";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({"autoConnect": false});

let joinedUsername : string;  // changed
let joinedRoom : string;


const roomContainer = document.getElementById('room-container') as HTMLElement
const addRoom = document.getElementById('add-room') as HTMLElement
const roomMenu = document.getElementById("room-menu") as HTMLElement;
const usernameContainer = document.getElementById('usernameContainer') as HTMLElement
const chatForm = document.getElementById('form')!
const chatContainer = document.getElementById('chat-container')!

window.addEventListener("load", () => {
  renderNameInput();
})


///////////////////////////////////////////////////////////////////////////
/**
 * function to render name input
 */
function renderNameInput() {
  chatForm.style.display = "none";
  chatContainer.style.display = "none";
  roomContainer.style.display = "none"
  addRoom.style.display = "none"
  usernameContainer.style.display = "none"
  let nameContainer = document.getElementById("name-container")!;
  let nameInputHeader = document.createElement("h3");
  nameInputHeader.innerText = "Your name here: ";
  let nameInput = document.createElement("input");
  nameInput.autocomplete = "off";
  nameInput.id = 'nameInput';
  let nameInputBtn = document.createElement("button");
  nameInputBtn.classList.add("nameBtn");
  nameInputBtn.innerText = "Start Messaging";
  nameInputBtn.addEventListener("click", () => {
    nameContainer.style.display = "none"
   
    //checks if name input empty, if true you can not submit name
    if ( nameInput.value === '' ) { 
      return;
    }
    socket.auth = { username: nameInput.value };
    socket.connect();  
  });
  nameContainer.append(nameInputHeader, nameInput, nameInputBtn);
}

///////////////////////////////////////////////////////////////////////////////
/**
 * function to display username in menu
 */

function usernameInMenu() {
  usernameContainer.style.display = "initial";
  const nameContainer = document.getElementById('usernameContainer')! ;
  const welcomeText = document.createElement("h2");
  welcomeText.innerText = `${joinedUsername}`;
  nameContainer.textContent = "";
  nameContainer?.append(welcomeText);
}

////////////////////////////////////////////////////////////////////////////////
/**
 * function to render room input
 */
function renderRoomInput() {
  roomContainer.style.display = "initial"
  addRoom.style.display = "initial"
  const addRoomIcon = document.getElementById('add-room-icon')!
  addRoomIcon.addEventListener("click", () => {
    addRoomIcon.style.display = "none"
  let container = document.createElement("div");
  container.classList.add('addRoomContainer');
  let roomInputHeader = document.createElement("h3");
  let roomInput = document.createElement("input");
  roomInput.maxLength = 20;
  roomInput.autocomplete = "off";
  roomInput.classList.add('roomInput')
  roomInput.placeholder = 'Room name';
  let roomInputBtn = document.createElement("button");
  roomInputBtn.classList.add('roomInputBtn');
  roomInputBtn.innerText = "Join";
  roomInputBtn.addEventListener("click", () => {
    const room = roomInput.value;
    if (!room.length) {
      console.log("Invalid name of room");
      return;
    }
    console.log(room)
    socket.emit("join", room);
    const roomName = document.createElement('p') as HTMLElement
    renderForm(room);
    renderRoomInfo(room, roomName)
    roomInput.value = '';
  });
  container.append(roomInputHeader, roomInput, roomInputBtn, addRoomIcon);
  addRoom.append(container)
  roomMenu.append(addRoom)
  })
}; 


////////////////////////////////////////////////////////////////////////////
     
/**
 * function to render message input
 */

let chatInput = document.getElementById("input") as HTMLInputElement; //tillsvidare utanför
function renderForm(room: string) {
  //let chatContainer = document.getElementById("chat-container") as HTMLElement;
  //let chatList = document.getElementById('messages') as HTMLElement;
  
  //chatList.id = "messages";
  //chatInput.id = "input"; 
  
  // username prints out when someone's typing
  chatContainer.style.display = 'inherit';
  chatForm.style.display = "inherit";

  const isTyping = document.getElementById('typing')!
  chatInput.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") {
      socket.emit("typing");
    }
    
    chatInput.addEventListener("keyup", function () {
        let timer;
         const waitTime = 3000;
        timer = setTimeout (() => {
         socket.emit("nottyping");
   }, waitTime)
     }); 
  });

  socket.on("typing", (username) => {
    isTyping.style.display = "initial";
    isTyping.innerHTML = username + " is typing...";
  });
   socket.on("nottyping", () => {
      //isTyping.style.display = "none"
      isTyping.innerHTML = ""
})

  chatForm.addEventListener("submit", (event) => {
    console.log('klickat')
    event.preventDefault();
    if (chatInput.value.length) {
    //  socket.emit("message", chatInput.value, joinedRoom);
    } else {
      console.log("Not allowed to send empty messages!");
    }
    console.log(chatInput.value)
  });
}

//////////////////////////////////////////////////////////////////////////


socket.on("connect_error", (err) => {
  if (err.message == "Invalid username") {
    console.log("You typed an invalid username, try again");
  }
});


socket.on("_error", (errorMessage) => {
  console.log(errorMessage);
});


/**
 * function to render rooms
 */
socket.on("roomList", (rooms) => {
  console.log(rooms)
  let roomContainer = document.getElementById('room-container')
  if(roomContainer) {
    roomContainer.innerHTML = '';
  }

  roomContainer?.classList.add('roomContainer')
  rooms.map((room) => {
    const roomName = document.createElement('p') as HTMLElement
    roomName.classList.add('room-name')
    roomName.innerText = room;
    roomContainer?.append(roomName)
    roomName.addEventListener('click', () => {
       //socket.emit("join", room);
       renderRoomInfo(room, roomName)
     })
  } )
 
});

////////////////////////////////////////////////////////////////////////

function renderRoomInfo (room: string, roomName: HTMLElement) {
  let roomHeader = document.getElementById('roomHeader')
      roomHeader!.innerHTML = room;
      socket.emit("join", room);
        
        if (roomName.innerText === roomHeader!.innerText) { 
      } else if (roomName.innerText != roomHeader!.innerText ) {

        let roomHeader = document.createElement("h3") as HTMLElement;
        roomHeader.innerText = room;
      }
       //socket.emit("join", room);
      console.log(room); 

       //Leave room
       let leaveBtn = document.createElement('p');
       leaveBtn.classList.add('leave-btn')
       leaveBtn.innerHTML = '< Leave room'
         roomHeader?.append(leaveBtn)
         leaveBtn.addEventListener('click', () => {
           socket.emit("leave", room);
           leaveRoom()
         })
}

//////////////////////////////////////////////////////////////

//Leave room text, bug when try to choose other room
function leaveRoom() {
  let chatContainer = document.getElementById("chat-container") as HTMLElement;
  chatContainer.style.display = "none";
}

///////////////////////////////////////////////////////////////////////////////

socket.on("joined", (room) => {
 
  let messageList = document.getElementById("messages") as HTMLElement;
  messageList.style.display = 'inherit';
  
  if (messageList) {
    messageList.innerHTML = "";
  }

  joinedRoom = room;

  console.log(room)
  renderForm(room);
});

//////////////////////////////////////////////

socket.on('message', (message, from) => {
  chatInput.value = ""

  const chatItem = document.createElement("li");
  chatItem.textContent = from.username + ":  " + message;
  
  const messageList = document.getElementById("messages");
  
  if (messageList) {
    messageList.append(chatItem);
  }
  window.scrollTo(1, document.body.scrollHeight);
});

///////////////////////////////////////////////

socket.on("connected", (username) => {
  console.log(username);
  joinedUsername = username; // changed

  usernameInMenu();
  renderRoomInput();
});

/* socket.on("userLeft", (room) => {
  console.log(room)
}) */



/* socket.on("disconnect", (reason) => {
  console.log(reason)// ...
}); */

/*
const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input") as HTMLInputElement;

form?.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input?.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  };
});

socket.on("welcome", (message) => {
  console.log(message);
});

socket.on("chat message", (message) => {
  const item = document.createElement("li");
  item.textContent = message;
  messages?.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
*/