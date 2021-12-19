//Loading dependencies & initializing express
var os = require("os");
var express = require("express");
var app = express();
var http = require("http");
//For signalling in WebRTC
var socketIO = require("socket.io");

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index.ejs");
});

var server = http.createServer(app);

server.listen(process.env.PORT || 3000);

var io = socketIO(server);

io.sockets.on("connection", function (socket) {
  // Convenience function to log server messages on the client.
  // Arguments is an array like object which contains all the arguments of log().
  // To push all the arguments of log() in array, we have to use apply().
  function log() {
    var array = ["Message from server:"];
    array.push.apply(array, arguments);
    socket.emit("log", array);
  }

  //Defining Socket Connections
  socket.on("message", function (message, room) {
    // for a real app, would be room-only (not broadcast)
    socket.to(room).emit("message", message, room);
  });

  socket.on("create or join", function (room, clientName) {
    log("Received request to create or join room " + room);
    var clientsInRoom = io.sockets.adapter.rooms.get(room);
    var numClients = clientsInRoom ? clientsInRoom.size : 0;
    log("Room " + room + " now has " + numClients + " client(s)");

    if (numClients === 0) {
      socket.join(room);
      log("Client ID " + socket.id + " created room " + room);
      socket.emit("created", room, socket.id);
    } else {
      log("Client ID " + socket.id + " joined room " + room);
      //this message ("join") will be received only by the previous clients since the last client has not joined the room yet
      //send to the clients the new client that will join the room
      io.sockets.in(room).emit("join", room, clientName, socket.id); //this client name is the name of the last client who wants to join
      socket.join(room);
      //this message will be received by all cleints after the join of the last client
      io.sockets.in(room).emit("ready");
    }
  });
  //send the this info(previous) as a private message to the user that is specified in the parameters(socketid)
  socket.on("previousclients", (previous,socketid) => {
    // to individual socketid (private message)
    io.to(socketid).emit("beforeyou",previous);
  });

  socket.on("bye", function () {
    console.log("received bye");
  });
});
