/*var Pool = require("pg").Pool;
var pool = new Pool({
  user: "mikolaj",
  host: "localhost",
  database: "rooms",
  password: "",
  port: 5432,
});*/

const getRoomState = function (postgres, name, id, callback) {
    postgres.query(`SELECT * FROM ${name} WHERE Id=${id}`, (err, res) => {
    if (err) {
      callback(err);
    }
    callback(null, res.rows);
  });
};

module.exports = { getRoomState };

//Kółko i krzyżyk
