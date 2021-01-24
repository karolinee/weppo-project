var database = require("./lib/databaseUtils.js");
var express = require("express");
var session = require("express-session");
var multer = require("multer");
var app = express();
var upload = multer();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var Pool = require("pg").Pool;
var pool = new Pool({
  user: "mikolaj",
  host: "localhost",
  database: "rooms",
  password: "",
  port: 5432,
});

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

app.post("/nickchange", upload.single(), (req, res) => {
  let games = [
    "warcaby",
    "warcaby",
    "warcaby",
    "warcaby",
    "warcaby",
    "warcaby",
    "warcaby",
  ];
  req.session.name = req.body.userid;
  res.render("index", {
    games: games,
    nick: req.session.name,
    sesID: req.sessionID,
  });
});

app.get("/", function (req, res) {
  let games = [
    "warcaby",
    "warcaby",
    "warcaby",
    "warcaby",
    "warcaby",
    "warcaby",
    "warcaby",
  ];

  if (req.session.name == undefined)
    req.session.name = "cahir" + req.sessionID.slice(0, 4);

<<<<<<< HEAD
  res.render("index", {
    games: games,
    nick: req.session.name,
    sesID: req.sessionID,
  });
=======
  res.render('index', { games: games, nick: req.session.name, sesID : req.sessionID});
>>>>>>> 356bccb3c52cddd396afd754eee7132c6d87f27f
});

app.get("/warcaby", function (req, res) {
  if (req.session.name == undefined)
<<<<<<< HEAD
    req.session.name = "cahir" + req.sessionID.slice(0, 4);
  res.render("game-page", {
    game: "warcaby",
    nick: req.session.name,
    sesID: req.sessionID,
  });
=======
    req.session.name = 'cahir' + req.sessionID.slice(0, 4)

  //let rooms = io.nsps['/'].adapter.rooms //jak będą pokoje i socket, pracuję na wersji bez socket io
  let rooms = {"room1": {sockets: {}, length: 1}, "room2": {sockets: {}, length: 1}, "room3": {sockets: {}, length: 2}};

  res.render('game-page', { game: 'warcaby', nick: req.session.name, sesID : req.sessionID, rooms: rooms});
>>>>>>> 356bccb3c52cddd396afd754eee7132c6d87f27f
});

io.on("connection", function (socket) {
  console.log("A user connected!"); // We'll replace this with our own events

  socket.on("createRoom", (data) => {
    socket.join("room-0");
    socket.emit("newRoom", { name: data.name, room: "room-0" });
  });
});

server.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
