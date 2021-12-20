//Loading dependencies & initializing express
var express = require("express");
var app = express();
var http = require("http");
var socketIO = require("socket.io");

app.use(express.static("public"));

//in order to render a html page for our app
app.get("/", function (req, res) {
  res.render("index.ejs");
});

var server = http.createServer(app);

server.listen(process.env.PORT || 3000);

var io = socketIO(server);

io.sockets.on("connection", function (socket) {
  //Defining Socket Connections
  socket.on("message", function (message, room) {
    // for a real app, would be room-only (not broadcast)
    socket.to(room).emit("message", message, room);
  });

  //every new client that will join the chat room will send this event to the server
  //and the server will respond acordingly
  socket.on("create or join", function (room, clientName) {
    var clientsInRoom = io.sockets.adapter.rooms.get(room);
    var numClients = clientsInRoom ? clientsInRoom.size : 0;
    if (numClients === 0) {
      socket.join(room);
      socket.emit("created", room, socket.id);
    } else {
      //this message ("join") will be received only by the previous clients since the last client has not joined the room yet
      //send to the clients the new client that will join the room
      io.sockets.in(room).emit("join", room, clientName, socket.id); //this client name is the name of the last client who wants to join
      socket.join(room);
      //this message will be received by all cleints after the join of the last client
      io.sockets.in(room).emit("ready");
    }
  });
  //send this info(previous) as a private message to the user that is specified in the parameters(socketid)
  socket.on("previousclients", (previous,socketid) => {
    // to individual socketid (private message)
    io.to(socketid).emit("beforeyou",previous);
  });

  socket.on("bye", function () {
    console.log("received bye");
  });
});
