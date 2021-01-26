var database = require("./lib/databaseUtils.js");
var express = require("express");
var session = require("express-session");
var multer = require("multer");
var app = express();
var upload = multer();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.set("view engine", "ejs");
app.set("views", "./views");
app.use("/styles", express.static(__dirname + "/views/styles/"));
app.use("/images", express.static(__dirname + "/views/images/"));
app.use("/scripts", express.static(__dirname + "/views/scripts"));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "qewhiugriasgy",
  })
);

let games = [
  "warcaby",
  "warcaby",
  "warcaby",
  "warcaby",
  "warcaby",
  "warcaby",
  "warcaby",
];

app.post("/nickchange", upload.single(), (req, res) => {
  req.session.name = req.body.userid;
  res.render("index", {
    games: games,
    nick: req.session.name,
    sesID: req.sessionID,
  });
});

app.get("/", function (req, res) {
  if (req.session.name == undefined)
    req.session.name = "cahir" + req.sessionID.slice(0, 4);

  res.render("index", {
    games: games,
    nick: req.session.name,
    sesID: req.sessionID,
  });
});

app.get("/warcaby", function (req, res) {
  if (req.session.name == undefined)
    req.session.name = "cahir" + req.sessionID.slice(0, 4);

  res.render("game-page", {
    game: "warcaby",
    nick: req.session.name,
    sesID: req.sessionID,
    rooms: rooms,
  });
});

var rooms = new Map();

io.on("connection", function (socket) {
  console.log("A user connected!");

  socket.on("createRoom", (data) => {
    console.log(data.name + " room created");
    socket.join(data.sesID);
    socket.emit("newRoom", { room: data.sesID, name: data.name });
    rooms = rooms.set(data.sesID, {
      room: data.sesID,
      name: data.name,
      player1: data.sesID,
      player2: NaN,
      size: 1,
    });
  });

  socket.on("joinRoom", (data) => {
    console.log(data.roomID + " joining room");
    console.log(data.player + " is joining");
    var room = rooms.get(data.roomID);
    if (room && room.size == 1) {
      console.log("done");
      socket.join(data.roomID);
      socket.broadcast.to(data.roomID).emit("player1", {});
      socket.emit("player2", { room: data.name });
      room.player2 = data.player;
      room.size = 2;
      rooms = rooms.set(data.roomID, room);
    } else {
      console.log("this room doesn't exist");
    }
  });

  socket.on("disconnecting", (reason) => {
    console.log(socket.rooms);
    for (let roomID of socket.rooms) {
      if (roomID != socket.id) {
        socket.to(roomID).emit("user has left", roomID);
        rooms.delete(roomID);
      }
    }
  });

  socket.on("leaveRoom", (data) => {
    if (!data.forced) {
      socket.to(data.roomID).emit("user has left", data.roomID);
      socket.leave(data.roomID);
      rooms.delete(data.roomID);
    } else {
      socket.leave(data.roomID);
    }
  });
});

server.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
