module.exports = function (io, roomsDraughts) {
  let nsp = io.of("/draughts");
  console.log("draughts io started");

  nsp.on("connection", (socket) => {
    console.log("A user connected to draughts!");

    socket.on("createRoom", (data) => {
      for (let roomID of nsp.adapter.rooms.keys()) {
        if (roomID == data.sesID) {
          socket.emit("cannotCreateRoom", {});
          return;
        }
      }
      socket.join(data.sesID);
      roomsDraughts = roomsDraughts.set(data.sesID, {
        room: data.sesID,
        name: data.name,
        player1: data.sesID,
        player2: NaN,
        size: 1,
        game: NaN,
      });
      socket.emit("roomJoined", {
        roomID: data.sesID,
      });
    });

    socket.on("joinRoom", (data) => {
      let room = roomsDraughts.get(data.roomID);
      if (room && room.player1 != data.player) {
        socket.join(data.roomID);
        room.player2 = data.player;
        room.size = 2;
        room.game = new Game();
        roomsDraughts.set(data.roomID, room);
        socket.emit("roomJoined", {
          roomID: room.room,
        });
        socket.emit("gameStarted", {
          turn: room.game.turn,
          you: 2,
        });
        socket.to(data.roomID).emit("gameStarted", {
          turn: room.game.turn,
          you: 1,
          board: room.game.board,
        });
      } else {
        socket.emit("cannotJoinRoom", {});
      }
    });


    socket.on("disconnecting", (reason) => {
      for (let roomID of socket.rooms) {
        if (roomID != socket.id) {
          socket.to(roomID).emit("user has left", roomID);
          roomsDraughts.delete(roomID);
        }
      }
    });

    socket.on("leaveRoom", (data) => {
      if (!data.forced) {
        socket.to(data.roomID).emit("user has left", data.roomID);
        roomsDraughts.delete(data.roomID);
      }
      socket.leave(data.roomID);
    });

    socket.on("madeTurn", (data) => {
      let room = roomsDraughts.get(data.roomID);
      //let toChange = room.game.dropCoin(data.column, data.player);
      /*
      if (isNaN(toChange)) {
        socket.emit("illegalMove", { turn: room.game.turn });
      } else {
        let ended = room.game.gameEnd();
        if (ended == -1) {
          nsp.to(data.roomID).emit("moveMade", {
            column: data.column,
            row: toChange,
            turn: room.game.turn,
          });
        } else {
          nsp.to(data.roomID).emit("gameEnded", {
            column: data.column,
            row: toChange,
            turn: room.game.turn,
            won: ended,
          });
        }
      }*/
    });
  });
};

class Game {
  constructor() {
    this.turn = 1;
    this.board = [
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
      [2, 0, 2, 0, 2, 0, 2, 0]
    ];
    this.pieces1 = 12;
    this.pieces2 = 12;
    //this.moves = 0;
  }

  end() {
    //-1 in progress
    //1 player 1 won
    //2 player2 won
    if (this.pieces1 == 0)
      return 2
    if (this.pieces2 == 0)
      return 1
    else
      return -1
  }

  check_possible_moves(pos, player, type) {
    let row = parseInt(pos.charAt(0), 10);
    let col = parseInt(pos.charAt(1), 10);
    possible_moves = []
    //1 player1 pawn
    //2 player2 pawn
    //3 player1 king
    //4 player2 king
    if (player == 1) {
      if (this.board[row][col] == 1 || this.board[row][col] == 3) { //from above for player 1
        if (col > 0 && this.board[row - 1][col - 1] == 0) {
          possible_moves.push(row - 1) //left side
          possible_moves.push(col - 1)
        }
        if (col < 7 && this.board[row - 1][col + 1] == 0) {
          possible_moves.push(row - 1)// right side
          possible_moves.push(col + 1)
        }
        if (col >= 2 && this.board[row - 2][col - 2] == 0 && (this.board[row - 1][col - 1] == 2 || this.board[row - 1][col - 1] == 4)) {
          possible_moves.push(row - 2)// left side capture
          possible_moves.push(col - 2)
        }
        if (col <= 5 && this.board[row - 2][col + 2] == 0 && (this.board[row - 1][col + 1] == 2 || this.board[row - 1][col + 1] == 4)) {
          possible_moves.push(row - 2)// left side capture
          possible_moves.push(col + 2)
        }
      }

      if (this.board[row][col] == 3) { //from below for player 1, king type, num 3
        if (col < 7 && this.board[row + 1][col + 1] == 0) {
          possible_moves.push(row + 1) //left side
          possible_moves.push(col + 1)
        }
        if (col > 0 && this.board[row + 1][col - 1] == 0) {
          possible_moves.push(row + 1)// right side
          possible_moves.push(col = 1)
        }
        if (col <= 5 && this.board[row + 2][col + 2] == 0 && (this.board[row + 1][col + 1] == 2 || this.board[row + 1][col + 1] == 4)) {
          possible_moves.push(row + 2)// left side capture
          possible_moves.push(col + 2)
        }
        if (col >= 2 && this.board[row + 2][col - 2] == 0 && (this.board[row + 1][col - 1] == 2 || this.board[row + 1][col - 1] == 4)) {
          possible_moves.push(row + 2)// left side capture
          possible_moves.push(col - 2)
        }
      }
    }


    if (player == 2) {
      if (this.board[row][col] == 4) { //from above for player 2, kin num4
        if (col > 0 && this.board[row - 1][col - 1] == 0) {
          possible_moves.push(row - 1) //left side
          possible_moves.push(col - 1)
        }
        if (col < 7 && this.board[row - 1][col + 1] == 0) {
          possible_moves.push(row - 1)// right side
          possible_moves.push(col + 1)
        }
        if (col >= 2 && this.board[row - 2][col - 2] == 0 && (this.board[row - 1][col - 1] == 1 || this.board[row - 1][col - 1] == 3)) {
          possible_moves.push(row - 2)// left side capture
          possible_moves.push(col - 2)
        }
        if (col <= 5 && this.board[row - 2][col + 2] == 0 && (this.board[row - 1][col + 1] == 1 || this.board[row - 1][col + 1] == 3)) {
          possible_moves.push(row - 2)// left side capture
          possible_moves.push(col + 2)
        }
      }

      if (this.board[row][col] == 2 || this.board[row][col] == 4) { //from below for player 2,
        if (col < 7 && this.board[row + 1][col + 1] == 0) {
          possible_moves.push(row + 1) //left side
          possible_moves.push(col + 1)
        }
        if (col > 0 && this.board[row + 1][col - 1] == 0) {
          possible_moves.push(row + 1)// right side
          possible_moves.push(col = 1)
        }
        if (col <= 5 && this.board[row + 2][col + 2] == 0 && (this.board[row + 1][col + 1] == 1 || this.board[row + 1][col + 1] == 3)) {
          possible_moves.push(row + 2)// left side capture
          possible_moves.push(col + 2)
        }
        if (col >= 2 && this.board[row + 2][col - 2] == 0 && (this.board[row + 1][col - 1] == 1 || this.board[row + 1][col - 1] == 3)) {
          possible_moves.push(row + 2)// left side capture
          possible_moves.push(col - 2)
        }
      }
    }
    return possible_moves, pos

  }

  move_piece(pos, move) { //and change type
    let row = parseInt(pos.charAt(0), 10);
    let col = parseInt(pos.charAt(1), 10);

    if (Math.abs(row - move[0]) == 1) { //move without capture
      var piece = this.board[row][col];
      this.board[row][col] = 0;
      this.board[move[0]][move[1]] = piece;
      if (move[0] == 0 && this.board[move[0]][move[1]] == 2)
        this.board[move[0]][move[1]] = 4 //promotion
      if (move[0] == 7 && this.board[move[0]][move[1]] == 2)
        this.board[move[0]][move[1]] = 3 //promotion
    }
    if (Math.abs(row - move[0]) == 2) { //move with capture
      var piece = this.board[row][col];
      this.board[row][col] = 0;
      var to_delete_x = (row+move[0])/2
      var to_delete_y = (col+move[1])/2
      if (this.board[to_delete_x][to_delete_y] == 1 || this.board[to_delete_x][to_delete_y] == 3) //deleting pieces
        pieces1 -= 1
      else
        pieces2 -= 1
      this.board[to_delete_x][to_delete_y] = 0

      this.board[move[0]][move[1]] = piece;

      if (move[0] == 0 && this.board[move[0]][move[1]] == 2)
        this.board[move[0]][move[1]] = 4 //promotion
      if (move[0] == 7 && this.board[move[0]][move[1]] == 1)
        this.board[move[0]][move[1]] = 3 //promotion
    }
    return
  }

}




