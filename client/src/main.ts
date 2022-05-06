import "./style/style.css";
import './style/nameForm.css';
import './style/roomMenu.css';
import "./style/roomList.css";
import "./style/chat.css";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../../types";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({"autoConnect": false});

let joinedUsername : string;  // changed
let joinedRoom : string;

const roomContainer = document.getElementById('room-container') as HTMLElement
const addRoom = document.getElementById('add-room') as HTMLElement
const roomMenu = document.getElementById("room-menu") as HTMLElement;
const usernameContainer = document.getElementById('usernameContainer') as HTMLElement


window.addEventListener("load", () => {
  renderNameInput();
})

/**
 * function to render name input
 */
function renderNameInput() {
  roomContainer.style.display = "none"
  addRoom.style.display = "none"
  usernameContainer.style.display = "none"
  let contentDiv = document.getElementById('content-div')
  
  let container = document.createElement("div");
  container.id = 'container';
  container.classList.add("inputNameContainer");

  let nameInputHeader = document.createElement("h3");
  nameInputHeader.innerText = "Your name here: ";

  let nameInput = document.createElement("input");

  nameInput.autocomplete = "off";
  nameInput.id = 'nameInput';


  let nameInputBtn = document.createElement("button");
  nameInputBtn.classList.add("nameBtn");
  nameInputBtn.innerText = "Start Messaging";

  nameInputBtn.addEventListener("click", () => {

    //checks if name input empty, if true you can not submit name
    if ( nameInput.value === '' ) {
      
      return;
    }

    container.innerHTML = ""
    socket.auth = { username: nameInput.value };
    socket.connect();
  });

  contentDiv?.append(container);
  //nameInput.append(badge);
  container.append(nameInputHeader, nameInput, nameInputBtn);
}

/**
 * function to display username in menu
 */

function usernameInMenu() {
  usernameContainer.style.display = "initial"

  const nameContainer = document.getElementById('usernameContainer')
  const welcomeText = document.createElement("h2")
  welcomeText.innerText = `${joinedUsername}`;

  nameContainer?.append(welcomeText)

 // console.log("look at me: ", joinedUsername)  // added 

}

/**
 * function to render room input
 */
function renderRoomInput() {
  roomContainer.style.display = "initial"
  addRoom.style.display = "initial"

  const addRoomIcon = document.getElementById('add-room-icon')
  
  addRoomIcon?.addEventListener("click", () => {
    
  let container = document.createElement("div");
  container.classList.add('addRoomContainer');
  //container.classList.add("inputRoomContainer");

  let roomInputHeader = document.createElement("h3");
  //roomInputHeader.innerText = "Create room: ";

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
  });
  container.append(roomInputHeader, roomInput, roomInputBtn, addRoomIcon);
  addRoom.append(container)
  roomMenu.append(addRoom)
  })
}; 
     
     /**
 * function to render message input
 */
let chatInput = document.createElement("input"); //tillsvidare utanför
function renderForm() {
  //document.body.innerHTML = "";
  let contentDiv = document.getElementById("content-div");
  let chatList = document.createElement("ul");
  chatList.id = "messages";
  chatInput.autocomplete = "off";
  chatInput.id = "input";
  

  // username prints out when someone's typing
  const isTyping = document.createElement("p");
  isTyping.classList.add('is-typing')
  chatInput.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") {
      socket.emit("typing");
      console.log("skriver");
    }
    
    chatInput.addEventListener("keyup", function () {
        let timer;
         const waitTime = 3000;
        timer = setTimeout (() => {
         socket.emit("nottyping");
         console.log("skriver inte");
   }, waitTime)
     }); 
    
  });

  socket.on("typing", (username) => {
    isTyping.style.display = "initial";
    isTyping.innerText = username + " is typing..";
    contentDiv?.append(isTyping);
  });

   socket.on("nottyping", (username) => {
      console.log('key släppt')
      console.log(username, 'slutat skriva')
      isTyping.style.display = "none"
})

  let chatForm = document.createElement("form");
  chatForm.id = "form";
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (chatInput.value.length) {
      socket.emit("message", chatInput.value, joinedRoom);
    } else {
      console.log("Not allowed to send empty messages!");
    }
    console.log(chatInput.value)
  });


  let sendBtn = document.createElement("button");
  sendBtn.innerText = "Send";
  chatForm.append(chatInput, sendBtn);
  contentDiv?.append(chatList, chatForm);
  
}

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
  let roomContainer = document.getElementById('room-container')
  if(roomContainer) {
    roomContainer.innerHTML = '';
  }

  roomContainer?.classList.add('roomContainer')
  for (let room of rooms) {
    const roomName = document.createElement('p')
    roomName.classList.add('room-name')
    roomName.innerText = room;
    roomContainer?.append(roomName)
     roomName.addEventListener('click', () => {
      socket.emit("join", room);
      console.log(room);
    })
  }
});

// 2. kolla så att joinedroom byts //JA
// 3. kontrollera att rummen blir rätt (på servern), kmr till 'join', getRooms //JA
// 4. töm chat vid rumbyte
// 5. lägga till rubrik på rum

socket.on("joined", (room) => {
  let messageList = document.getElementById('messages');
  if(messageList) {
    messageList.innerHTML = '';
  }

  joinedRoom = room;
  renderForm(); //add room in param 
});


socket.on('message', (message, from) => {
  chatInput.value = ""

  console.log(message, from.username);
  const chatItem = document.createElement("li");
  chatItem.textContent = from.username + ": " + message;
  const messageList = document.getElementById("messages");
  if (messageList) {
    messageList.append(chatItem);
  }
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("connected", (username) => {
  console.log(username);
  joinedUsername = username; // changed

  usernameInMenu();
  renderRoomInput();
});

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