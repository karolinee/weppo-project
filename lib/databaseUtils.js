
const createRoom = function (postgres, name, id, playerOneID, callback) {
    postgres.query(
	`INSERT INTO ${name} (id, playeroneid) VALUES (${id}, ${playerOneID})`,
	(err, res) => {
	    callback(err,res);
	});
};

const addSecondPlayer = function (postgres, name, id, playerTwoID, callback) {
    postgres.query(
	`UPDATE ${name} SET playertwoid = ${playerTwoID} WHERE id=${id}`,
	(err, res) => {
	    callback(err,res);
	});
};
    

const destroyRoom = function (postgres, name, id, callback) {
    postgres.query(`DELETE FROM ${name} WHERE id=${id}`, (err, res) => {
	if (err) {
	    callback(err);
	}
	callback(null, res);
    });
};

const getRoomState = function (postgres, name, id, callback) {
    postgres.query(`SELECT * FROM ${name} WHERE id=${id}`, (err, res) => {
    if (err) {
      callback(err);
    }
    callback(null, res.rows);
  });
};

//For every game it's state represenation can differ so it will have it's own function to update state
const changeStateTicTacToe = function (postgres, id, state, callback) {
    postgres.query(
	`UPDATE tictactoe SET state='${state}' WHERE id=${id}`,
	(err,res) => {
	    callback(err,res);
	});
};

module.exports = { getRoomState, createRoom, addSecondPlayer, destroyRoom, changeStateTicTacToe };

//Kółko i krzyżyk
