//Defining some global utility variables
var clientName = "user_" + Math.floor(Math.random() * 1000 + 1);
var remoteclients = [];
var isInitiator = false;
document.getElementById("yourname").innerHTML = "You: " + clientName;

// Prompting for room name:
// var room = prompt('Enter room name:');
//setting test room
var room = "test";

//Initializing socket.io
var socket = io.connect();

//Ask server to add in the room if room name is provided by the user
if (room !== "") {
  // socket.emit('create or join', room);
  // console.log('Attempted to create or  join room', room);
}

//Defining socket events

//Event - Client has created the room i.e. is the first member of the room
socket.on("created", function (room) {
  console.log("Created room " + room);
  isInitiator = true;
});

//Event - Another client tries to join room
//this message is received only by the client that connected first
//when the second peer is connected
socket.on("join", function (room, client, socketid) {
  console.log(
    "Another peer made a request to join room " +
      room +
      " whith name :" +
      client
  );
  console.log("This peer is the initiator of room " + room + "!");
  sendmessagebutton.disabled = false;
  //if the client is the creator send to the client that just connected the array of the other users names
  if (isInitiator) {
    beforeclients = remoteclients.slice(); //or [...remoteclients]
    beforeclients.push(clientName);
    socket.emit("previousclients", beforeclients, socketid);
  }

  remoteclients.push(client);
  document.getElementById("remotename").innerHTML = remoteclients;
});

//this message will be received by the last client that will connect to the room
//and has the names of all the other users before him, this information is provided by the creator of the room
//as he has all the names of every next client joins the room
socket.on("beforeyou", (previous) => {
  remoteclients = previous;
  console.log(previous);
  document.getElementById("remotename").innerHTML = remoteclients;
  sendmessagebutton.disabled = false;
});


//Event - server asks to log a message
socket.on("log", function (array) {
  console.log.apply(console, array);
});

socket.on("message", function (message, room) {
  viewmsgtoelement(document.getElementById("messagesent"), message);
});

//Function to send message in a room
function sendMessage(message, room) {
  console.log("Client sending message: ", message, room);
  socket.emit("message", message, room);
}

//Sending bye if user closes the window
window.onbeforeunload = function () {
  sendMessage("bye", room);
};

var connectbutton = document.getElementById("connectbutton");
if (connectbutton) {
  connectbutton.addEventListener("click", () => {
    if (connectbutton.innerHTML !== "Connected") {
      socket.emit("create or join", room, clientName);
    }
    connectbutton.innerHTML = "Connected";
    //connection logic
  });
}

let messagetexted = "";
//DOM elements

var messageinput = document.getElementById("messagearea");
if (messageinput) {
  //Tip: This event is similar to the onchange event.
  //The difference is that the oninput event occurs immediately
  // after the value of an element has changed, while onchange occurs
  //when the element loses focus, after the content has been changed.
  //The other difference is that the onchange event also works on <select> elements.
  messageinput.addEventListener("input", (event) => {
    messagetexted = event.target.value;
  });
}

var sendmessagebutton = document.getElementById("sendmessage");
if (sendmessagebutton) {
  sendmessagebutton.disabled = true;
  sendmessagebutton.addEventListener("click", () => {
    var themessage = "<p>" + clientName + ":" + messagetexted + "</p>";
    viewmsgtoelement(document.getElementById("messagesent"), themessage);
    sendMessage(themessage, room);
    messageinput.value = "";
    messagetexted = "";
  });
}

function viewmsgtoelement(element, message) {
  element.innerHTML += "\n" + message;
}
