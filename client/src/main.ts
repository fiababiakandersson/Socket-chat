import "./style.css";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../../types";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({"autoConnect": false});

let username : string;
let joinedRoom : string;

window.addEventListener("load", () => {
  renderNameInput();
  //renderRoomInput();
})

function renderNameInput() {
  document.body.innerHTML = "";

  let container = document.createElement("div");
  container.classList.add("inputNameContainer");

  let nameInputHeader = document.createElement("h3");
  nameInputHeader.innerText = "Your name here: ";

  let nameInput = document.createElement("input");

  let nameInputBtn = document.createElement("button");
  nameInputBtn.innerText = "Save";
  nameInputBtn.addEventListener("click", () => {
    socket.auth = { username: nameInput.value };
    socket.connect();
  });

  container.append(nameInputHeader, nameInput, nameInputBtn);
  document.body.append(container);
}

function renderRoomInput() {
  document.body.innerHTML = "";

  let container = document.createElement("div");
  container.classList.add("inputRoomContainer");

  let roomInputHeader = document.createElement("h3");
  roomInputHeader.innerText = "Room here: ";

  let roomInput = document.createElement("input");

  let roomInputBtn = document.createElement("button");
  roomInputBtn.innerText = "Join";
  roomInputBtn.addEventListener("click", () => {
    const room = roomInput.value;
    if (!room.length) {
      console.log("Invalid name of room");
      return;
    }
    socket.emit("join", room);
  });

  container.append(roomInputHeader, roomInput, roomInputBtn);
  document.body.append(container);

};

function renderForm() {
   document.body.innerHTML = "";

   let chatList = document.createElement('ul');
   chatList.id = "messages";

   let chatInput = document.createElement('input');
   chatInput.autocomplete = "off";
   chatInput.id = 'input';

   let chatForm = document.createElement('form');
   chatForm.id = 'form';
   chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if(chatInput.value.length) { 
        socket.emit("message", chatInput.value, joinedRoom);
      } else {
        console.log('Not allowes to send empty messages!');  
      };
   })

   let sendBtn = document.createElement('button');
   sendBtn.innerText = 'Send';

   chatForm.append(chatInput, sendBtn);
   document.body.append(chatList, chatForm);
};

socket.on("connect_error", (err) => {
  if(err.message == "Invalid username") {
    console.log('You typed an invalid username, try again');  
  };
});

socket.on('_error', (errorMessage) => {
  console.log(errorMessage);
  
});

socket.on("roomList", (rooms) => {
  //Skapa gränssnitt med att kunna skapa rum
  //Skapa gränssnitt med rum, lista, med onClick event på rum som skickar med join på det rummet
  console.log(rooms);
  
});


socket.on("joined", (room) => {
  joinedRoom = room;
  renderForm();
});


socket.on('message', (message, from) => {
  console.log(message, from.username);

  const chatItem = document.createElement('li');
  chatItem.textContent = from.username + ": " + message;

  const messageList = document.getElementById('messages');

  if(messageList) {
    messageList.append(chatItem);
  }

  window.scrollTo(0, document.body.scrollHeight);
  
});


socket.on("connected", (username) => {
  console.log(username);
  username = username;

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