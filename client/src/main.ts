import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../../types";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  autoConnect: false,
});

let joinedUsername: string;
let joinedRoom: string;

/**
 * Global vairables */ 
const roomContainer = document.getElementById("room-container") as HTMLElement;
const addRoom = document.getElementById("add-room") as HTMLElement;
const roomMenu = document.getElementById("room-menu") as HTMLElement;
const usernameContainer = document.getElementById("usernameContainer") as HTMLElement;
const chatForm = document.getElementById("form")!;
const chatContainer = document.getElementById("chat-container")!;
const chatInput = document.getElementById("input") as HTMLInputElement;
const addRoomIcon = document.getElementById("add-room-icon")!;

/**
 * EventListener
 */
window.addEventListener("load", () => {
  renderNameInput();
  addEventListeners();
});

/**
 * EventListeners
 */
function addEventListeners() {
  addSubmitMessageListener();
  addTypingListeners();
}

function addSubmitMessageListener() {
  chatForm.addEventListener("submit", (event) => {
    console.log("klickat");
    event.preventDefault();
    if (chatInput.value.length) {
      socket.emit("message", chatInput.value, joinedRoom);
    } else {
      console.log("Not allowed to send empty messages!");
    }
    console.log(chatInput.value);
  });
}

function addTypingListeners() {
  const isTyping = document.getElementById("typing")!;

  // Send events
  chatInput.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") {
      socket.emit("typing");
    }
  });
  chatInput.addEventListener("keyup", function () {
    const waitTime = 3000;
    setTimeout(() => {
      socket.emit("nottyping");
    }, waitTime);
  });

  // Recieve events
  socket.on("typing", (username) => {
    isTyping.style.display = "initial";
    isTyping.innerHTML = username + " is typing...";
  });
  socket.on("nottyping", () => {
    isTyping.innerHTML = "";
  });
}

/**
 * function to render name input
 */
function renderNameInput() {
  chatForm.style.display = "none";
  chatContainer.style.display = "none";
  roomContainer.style.display = "none";
  addRoom.style.display = "none";
  usernameContainer.style.display = "none";
  let nameContainer = document.getElementById("name-container")!;
  let nameInputHeader = document.createElement("h3");
  nameInputHeader.innerText = "Your name here: ";
  let nameInput = document.createElement("input");
  nameInput.autocomplete = "off";
  nameInput.id = "nameInput";
  let nameInputBtn = document.createElement("button");
  nameInputBtn.classList.add("nameBtn");
  nameInputBtn.innerText = "Start Messaging";
  nameContainer.append(nameInputHeader, nameInput, nameInputBtn);
  nameInputBtn.addEventListener("click", () => {
    nameContainer.style.display = "none";

    // Checks if name input empty, if true you can not submit name
    if (nameInput.value === "") {
      return;
    }
    socket.auth = { username: nameInput.value };
    socket.connect();
  });
}

/**
 * Function to display username in menu
 */
function usernameInMenu() {
  usernameContainer.style.display = "initial";
  const nameContainer = document.getElementById("usernameContainer")!;
  const welcomeText = document.createElement("h2");
  welcomeText.innerText = `Welcome ${joinedUsername}`;
  nameContainer.textContent = "";
  nameContainer?.append(welcomeText);
}

/**
 * Function for adding a room name
 */
function renderRoomForm() {
  addRoomIcon.style.display = "none";
  let container = document.createElement("div");
  container.classList.add("addRoomContainer");
  let roomInputHeader = document.createElement("h3");
  let roomInput = document.createElement("input");
  roomInput.maxLength = 20;
  roomInput.autocomplete = "off";
  roomInput.classList.add("roomInput");
  roomInput.placeholder = "Room name";
  let roomInputBtn = document.createElement("button");
  roomInputBtn.classList.add("roomInputBtn");
  roomInputBtn.innerText = "Join";

  roomInputBtn.addEventListener("click", () => joinRoomAndShowUI(roomInput));

  container.append(roomInputHeader, roomInput, roomInputBtn, addRoomIcon);
  addRoom.append(container);
  roomMenu.append(addRoom);
}

/**
 * Function for joining room and display chat UI
 */
function joinRoomAndShowUI(roomInput: HTMLInputElement) {
  const room = roomInput.value;
  if (!room.length) {
    console.log("Invalid name of room");
    return;
  }
  console.log(room);
  socket.emit("join", room);
  const roomName = document.createElement("p") as HTMLElement;

  renderRoomInfo(room, roomName);
  roomInput.value = "";
}

/**
 * Function to show add room icon
 */
function renderAddRoomIcon() {
  roomContainer.style.display = "initial";
  addRoom.style.display = "initial";
  addRoomIcon.addEventListener("click", renderRoomForm);
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
  * Function to render rooms in side menu
  */
socket.on("roomList", (rooms) => {
  let roomContainer = document.getElementById("room-container");
  if (roomContainer) {
    roomContainer.innerHTML = "";
  }

  roomContainer?.classList.add("roomContainer");
  rooms.map((room) => {
    const roomName = document.createElement("p") as HTMLElement;
    roomName.classList.add("room-name");
    roomName.innerText = room;
    roomContainer?.append(roomName);
    roomName.addEventListener("click", () => {
      console.log('klick')
      renderRoomInfo(room, roomName);
    });
  });
});

////////////////////////////////////////////////////////////////////////

function renderRoomInfo(room: string, roomName: HTMLElement) {
   // Show relevant UI
   chatContainer.style.display = "inherit";
   chatForm.style.display = "inherit";

  let roomHeader = document.getElementById("roomHeader");
  roomHeader!.innerHTML = room;
  socket.emit("join", room);

  if (roomName.innerText === roomHeader!.innerText) {
  } else if (roomName.innerText != roomHeader!.innerText) {
    let roomHeader = document.createElement("h3") as HTMLElement;
    roomHeader.innerText = room;
  }

  //Leave room
  let leaveBtn = document.createElement("p");
  leaveBtn.classList.add("leave-btn");
  leaveBtn.innerHTML = "< Leave room";
  roomHeader?.append(leaveBtn);
  leaveBtn.addEventListener("click", () => {
    socket.emit("leave", room);
    leaveRoom();
  });
}

//////////////////////////////////////////////////////////////

/**
 *  Leave room, emty UI
 */
function leaveRoom() {
  let chatContainer = document.getElementById("chat-container") as HTMLElement;
  chatContainer.style.display = "none";

}

///////////////////////////////////////////////////////////////////////////////

socket.on("joined", (room) => {
  let messageList = document.getElementById("messages") as HTMLElement;
  messageList.style.display = "inherit";
  if (messageList) {
    messageList.innerHTML = "";
  }
  joinedRoom = room;
});

//////////////////////////////////////////////

socket.on("message", (message, from) => {
  chatInput.value = "";
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
  joinedUsername = username;
  usernameInMenu();
  renderAddRoomIcon();
});