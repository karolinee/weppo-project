const database = require("./lib/databaseUtils.js");
var express = require("express");
var app = express();
var Pool = require("pg").Pool;
var pool = new Pool({
  user: "mikolaj",
  host: "localhost",
  database: "rooms",
  password: "",
  port: 5432,
});

//examples of database's interface uses
database.createRoom(pool, "tictactoe", 3781014, 3781014, (err, res) => {
  if (err) {
    console.log("createRoom");
    console.log(err);
  }

  database.changeStateTicTacToe(
    pool,
    3781014,
    "{{1,2,0},{0,0,0},{2,1,1}}",
    (err, res) => {
      if (err) {
        console.log("changeState");
        console.log(err);
      }
      database.addSecondPlayer(
        pool,
        "tictactoe",
        3781014,
        1234567,
        (err, res) => {
          if (err) {
            console.log("addsecondplayer");
            console.log(err);
          }

          database.getRoomState(pool, "tictactoe", 3781014, (err, res) => {
            if (err) {
              console.log("getRoomState");
              console.log(err);
            }
            console.log(res);
	      database.destroyRoom(pool, 'tictactoe', 3781014, (err,res) => {
		  if (err) {
		      console.log('destroyroom');
		      console.log(err);
		  }});
          });
        }
      );
    }
  );
});

app.set("view engine", "ejs");
app.set("views", "./views");
app.use("/styles", express.static(__dirname + "/views/styles/"));
app.use("/images", express.static(__dirname + "/views/images/"));
app.use(
  express.urlencoded({
    extended: true,
  })
);

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
  res.render("index", { games: games });
});

app.get("/warcaby", function (req, res) {
  res.render("game-page", { game: "warcaby" });
});
app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
