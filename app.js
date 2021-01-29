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

var rooms4Connect = new Map();
var roomsTictactoe = new Map();

let games = [
  "tictactoe",
  "4connect",
  "warcaby"
];

app.get("/nickchange", function(req, res) {
  if (req.session.name == undefined)
    req.session.name = "anon";
  res.render("nickchange", {nick: req.session.name});
});

app.post("/nickchange", function(req, res) {
  let newNick = req.body.newNick;
  if(newNick){
    req.session.name = newNick;
  }
  res.redirect("/");
});

app.get("/", function (req, res) {
  if (req.session.name == undefined)
    req.session.name = "anon";

  res.render("index", {
    games: games,
    nick: req.session.name,
    sesID: req.sessionID,
  });
});

app.get("/warcaby", function (req, res) {
  if (req.session.name == undefined)
    req.session.name = "anon";

  res.render("game-page", {
    game: "warcaby",
    nick: req.session.name,
    sesID: req.sessionID,
    rooms: rooms,
  });
});

app.get("/4connect", (req, res) => {
  if (req.session.name == undefined)
    req.session.name = "anon";

  res.render("4connect", {
    game: "4connect",
    nick: req.session.name,
    sesID: req.sessionID,
    rooms: rooms4Connect,
  });
});

require("./lib/4connect.js")(io, rooms4Connect);
var rooms = new Map();

app.get("/tictactoe", (req, res) => {
  if (req.session.name == undefined)
    req.session.name = "anon";

  res.render("tictactoe", {
    game: "tictactoe",
    nick: req.session.name,
    sesID: req.sessionID,
    rooms: roomsTictactoe,
  });
});

require("./lib/tictactoe.js")(io, roomsTictactoe);

server.listen(process.env.PORT || 3000, function () {
  console.log("Example app listening on port 3000!");
});
