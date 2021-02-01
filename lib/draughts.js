module.exports = function (io, roomsDraughts) {
  let nsp = io.of("/draughts");
  console.log("draughts io started");

  nsp.on("connection", (socket) => {

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
        player1Nick: data.nick,
        player2Nick: NaN,
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
        room.player2Nick = data.nick;
        roomsDraughts.set(data.roomID, room);
        socket.emit("roomJoined", {
          roomID: room.room,
        });
        socket.emit("gameStarted", {
          turn: room.game.turn,
          you: 2,
          board: room.game.board,
          opponent: room.player1Nick,
        });
        socket.to(data.roomID).emit("gameStarted", {
          turn: room.game.turn,
          you: 1,
          board: room.game.board,
          opponent: room.player2Nick,
        });
      } else {
        socket.emit("cannotJoinRoom", {});
      }
    });


    socket.on("disconnecting", (reason) => {
      for (let roomID of socket.rooms) {
        if (roomID != socket.id) {
          socket.to(roomID).emit("userHasLeft", roomID);
          roomsDraughts.delete(roomID);
        }
      }
    });

    socket.on("leaveRoom", (data) => {
      if (!data.forced) {
        socket.to(data.roomID).emit("userHasLeft", data.roomID);
        roomsDraughts.delete(data.roomID);
      }
      socket.leave(data.roomID);
    });


    socket.on("checkMoves", (data) => {
      let room = roomsDraughts.get(data.roomID);
      let check = room.game.check_possible_moves([data.pos[0], data.pos[1]], data.player)
      let moves = check[0]
      if (moves == []) { //when no moves from position
        socket.emit("illegalMove", { turn: room.game.turn });
      }
      else {
        let valid = false
        for (let i = 0; i < moves.length; i += 2) {
          if (moves[i] == data.pos[2] && moves[i + 1] == data.pos[3])
            valid = true
        }
        if (valid == false) {
          socket.emit("illegalMove", { turn: room.game.turn });
        }
        else {
          room.game.move_piece([data.pos[0], data.pos[1]], [data.pos[2], data.pos[3]])
          let ended = room.game.end();
          if (ended == -1) {
            nsp.to(data.roomID).emit("moveMade", {
              pos: data.pos,
              turn: room.game.turn,
              board: room.game.board,
            });
          } else {
            nsp.to(data.roomID).emit("gameEnded", {
              turn: room.game.turn,
              won: ended,
              pos: data.pos,
              board : room.game.board,
            });
          }
        }
      }
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

  check_possible_moves(pos, player) {
    let row = pos[0]
    let col = pos[1]
    let possible_moves = []
    //1 player1 pawn
    //2 player2 pawn
    //3 player1 king
    //4 player2 king
    if (player == 1) {   

      if (this.board[row][col] == 1 || this.board[row][col] == 3) { //from above for player 1
        if (col > 0 && row <7 && this.board[row + 1][col - 1] == 0) {
          possible_moves.push(row + 1) //left side
          possible_moves.push(col - 1)
        }
        if (col < 7 && row <7 && this.board[row + 1][col + 1] == 0) {
          possible_moves.push(row + 1)// right side
          possible_moves.push(col + 1)
        }
        if (col >= 2 && row <6 &&this.board[row + 2][col - 2] == 0 && (this.board[row + 1][col - 1] == 2 || this.board[row + 1][col - 1] == 4)) {
          possible_moves.push(row + 2)// left side capture
          possible_moves.push(col - 2)
        }
        if (col <= 5 && row <6 &&this.board[row + 2][col + 2] == 0 && (this.board[row + 1][col + 1] == 2 || this.board[row + 1][col + 1] == 4)) {
          possible_moves.push(row + 2)// left side capture
          possible_moves.push(col + 2)
        }
      }

      if (this.board[row][col] == 3) { //from below for player 1, king type, num 3
        if (col < 7 && row >0 && this.board[row - 1][col + 1] == 0) {
          possible_moves.push(row - 1) //left side
          possible_moves.push(col + 1)
        }
        if (col > 0 && row >0 && this.board[row - 1][col - 1] == 0) {
          possible_moves.push(row - 1)// right side
          possible_moves.push(col - 1)
        }
        if (col <= 5 && row >1 &&this.board[row - 2][col + 2] == 0 && (this.board[row - 1][col + 1] == 2 || this.board[row - 1][col + 1] == 4)) {
          possible_moves.push(row - 2)// left side capture
          possible_moves.push(col + 2)
        }
        if (col >= 2 && row >1 && this.board[row - 2][col - 2] == 0 && (this.board[row - 1][col - 1] == 2 || this.board[row - 1][col - 1] == 4)) {
          possible_moves.push(row - 2)// left side capture
          possible_moves.push(col - 2)
        }
      }
    }


    if (player == 2) {
      if (this.board[row][col] == 4) { //from above for player 2, kin num4
        if (col > 0 && row <7 && this.board[row + 1][col - 1] == 0) {
          possible_moves.push(row + 1) //left side
          possible_moves.push(col - 1)
        }
        if (col < 7 && row <7 && this.board[row + 1][col + 1] == 0) {
          possible_moves.push(row + 1)// right side
          possible_moves.push(col + 1)
        }
        if (col >= 2 && row <6 && this.board[row + 2][col - 2] == 0 && (this.board[row + 1][col - 1] == 1 || this.board[row + 1][col - 1] == 3)) {
          possible_moves.push(row + 2)// left side capture
          possible_moves.push(col - 2)
        }
        if (col <= 5 && row <6 && this.board[row + 2][col + 2] == 0 && (this.board[row + 1][col + 1] == 1 || this.board[row + 1][col + 1] == 3)) {
          possible_moves.push(row + 2)// left side capture
          possible_moves.push(col + 2)
        }
      }
      if (this.board[row][col] == 2 || this.board[row][col] == 4) { //from below for player 2,
        if (col < 7 && row >0 && this.board[row - 1][col + 1] == 0) {
          possible_moves.push(row - 1) //left side
          possible_moves.push(col + 1)
        }
        if (col > 0 && row >0 && this.board[row - 1][col - 1] == 0) {
          possible_moves.push(row - 1)// right side
          possible_moves.push(col - 1)
        }
        if (col <= 5 && row >1 && this.board[row - 2][col + 2] == 0 && (this.board[row - 1][col + 1] == 1 || this.board[row - 1][col + 1] == 3)) {
          possible_moves.push(row - 2)// left side capture
          possible_moves.push(col + 2)
        }
        if (col >= 2 && row >1 && this.board[row - 2][col - 2] == 0 && (this.board[row - 1][col - 1] == 1 || this.board[row - 1][col - 1] == 3)) {
          possible_moves.push(row - 2)// left side capture
          possible_moves.push(col - 2)
        }
      }
    }
    return [possible_moves, pos]

  }

  move_piece(pos, move) { //and change type
    let row = pos[0]
    let col = pos[1]

    this.turn = this.turn == 1 ? 2 : 1;

    if (Math.abs(row - move[0]) == 1) { //move without capture
      var piece = this.board[row][col];
      this.board[row][col] = 0;
      this.board[move[0]][move[1]] = piece;
      if (move[0] == 0 && this.board[move[0]][move[1]] == 2)
        this.board[move[0]][move[1]] = 4 //promotion
      if (move[0] == 7 && this.board[move[0]][move[1]] == 1)
        this.board[move[0]][move[1]] = 3 //promotion
    }
    if (Math.abs(row - move[0]) == 2) { //move with capture
      var piece = this.board[row][col];
      this.board[row][col] = 0;
      var to_delete_x = (row + move[0]) / 2
      var to_delete_y = (col + move[1]) / 2
      if (this.board[to_delete_x][to_delete_y] == 1 || this.board[to_delete_x][to_delete_y] == 3) //deleting pieces
        this.pieces1 -= 1
      else
      this.pieces2 -= 1
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




