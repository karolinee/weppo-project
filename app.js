var database = require("./lib/databaseUtils.js");
var express = require('express');
var session = require('express-session');

var app = express();
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
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(session({
    resave: true, saveUninitialized: true, secret:
        'qewhiugriasgy'
}));


app.get('/', function (req, res) {
    let games = ['warcaby', 'warcaby', 'warcaby', 'warcaby', 'warcaby', 'warcaby', 'warcaby'];
    let sesID = req.sessionID;
    if (req.session){
        sesID = 'cahir' + sesID.slice(0,4)
    }
    res.render('index', { games: games, sesID : sesID});
});

app.get('/warcaby', function (req, res) {
    let sesID = req.sessionID;
    if (req.session){
        sesID = 'cahir' + sesID.slice(0,4)
    }
    res.render('game-page', { game: 'warcaby', sesID:sesID});
});
  
app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
