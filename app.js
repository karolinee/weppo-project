const database = require('./lib/databaseUtils.js');
var express = require('express');
var app = express();
var Pool = require("pg").Pool;
var pool = new Pool({
  user: "mikolaj",
  host: "localhost",
  database: "rooms",
  password: "",
  port: 5432,
});

database.getRoomState(pool, 'tictactoe', 3781014, (err, res) => {
    if (err) {
	console.log(err);
    }
    console.log(res);
});
app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/styles', express.static(__dirname + '/views/styles/'));
app.use('/images', express.static(__dirname + '/views/images/'));
app.use(express.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    let games = ['warcaby', 'warcaby', 'warcaby', 'warcaby', 'warcaby', 'warcaby', 'warcaby'];
    res.render('index', { games: games});
});

app.get('/warcaby', function (req, res) {
    res.render('game-page', { game: 'warcaby'});
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

