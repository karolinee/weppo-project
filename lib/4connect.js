module.exports = function (io, rooms4Connect) {
  let nsp = io.of("/4connect");
  console.log("4connet io started");

  nsp.on("connection", (socket) => {
    console.log("A user connected to 4connect!");

    socket.on("createRoom", (data) => {
      for (let roomID of nsp.adapter.rooms.keys()) {
        if (roomID == data.sesID) {
          socket.emit("cannotCreateRoom", {});
          return;
        }
      }
      socket.join(data.sesID);
      rooms4Connect = rooms4Connect.set(data.sesID, {
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
      let room = rooms4Connect.get(data.roomID);
      if (room && room.player1 != data.player && room.size < 2) {
        socket.join(data.roomID);
        room.player2 = data.player;
        room.size = 2;
        room.game = new Game();
        rooms4Connect.set(data.roomID, room);
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
        });
      } else {
        socket.emit("cannotJoinRoom", {});
      }
    });

    socket.on("disconnecting", (reason) => {
      for (let roomID of socket.rooms) {
        if (roomID != socket.id) {
          socket.to(roomID).emit("userHasLeft", roomID);
          rooms4Connect.delete(roomID);
        }
      }
    });

    socket.on("leaveRoom", (data) => {
      if (!data.forced) {
        socket.to(data.roomID).emit("userHasLeft", data.roomID);
        rooms4Connect.delete(data.roomID);
      }
      socket.leave(data.roomID);
    });

    socket.on("madeTurn", (data) => {
      let room = rooms4Connect.get(data.roomID);
      let toChange = room.game.dropCoin(data.column, data.player);
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
      }
    });
  });
};

class Game {
  constructor() {
    this.turn = 1;
    this.board = this.getBoard();
  }

  getBoard() {
    let board = new Array(7);
    for (let i = 0; i < 7; i++) {
      board[i] = new Array(6);
      for (let j = 0; j < 6; j++) {
        board[i][j] = 0;
      }
    }
    return board;
  }

  dropCoin(column, player) {
    if (player != this.turn) {
      return NaN;
    }
    let toChange = -1;
    for (let i = 0; i < 6; i++) {
      if (this.board[column][i] == 0) {
        toChange = i;
        break;
      }
    }
    if (toChange < 0) {
      return NaN;
    }
    this.board[column][toChange] = this.turn;
    this.turn = this.turn == 1 ? 2 : 1;

    return toChange;
  }

  gameEnd() {
    // -1 -> game still goes on
    // 0 -> draw
    // 1 -> first player won
    // 2 -> second player won

    //vertical
    let firstPlayerChain;
    let secondPlayerChain;
    for (let i = 0; i < 7; i++) {
      firstPlayerChain = 0;
      secondPlayerChain = 0;
      for (let j = 0; j < 6; j++) {
        if (this.board[i][j] == 1) {
          firstPlayerChain += 1;
          secondPlayerChain = 0;
        } else if (this.board[i][j] == 2) {
          firstPlayerChain = 0;
          secondPlayerChain += 1;
        } else {
          firstPlayerChain = 0;
          secondPlayerChain = 0;
        }
        if (firstPlayerChain >= 4) {
          return 1;
        } else if (secondPlayerChain >= 4) {
          return 2;
        }
      }
    }
    //horizontal
    for (let i = 0; i < 6; i++) {
      firstPlayerChain = 0;
      secondPlayerChain = 0;
      for (let j = 0; j < 7; j++) {
        if (this.board[j][i] == 1) {
          firstPlayerChain += 1;
          secondPlayerChain = 0;
        } else if (this.board[j][i] == 2) {
          firstPlayerChain = 0;
          secondPlayerChain += 1;
        } else {
          firstPlayerChain = 0;
          secondPlayerChain = 0;
        }
        if (firstPlayerChain >= 4) {
          return 1;
        } else if (secondPlayerChain >= 4) {
          return 2;
        }
      }
    }

    //diagonal
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        if (j + 3 < 7 && i + 3 < 6) {
          let allFirstPlayer = true;
          let allSecondPlayer = true;
          for (let k = 0; k < 4; k++) {
            if (this.board[j + k][i + k] != 1) {
              allFirstPlayer = false;
            }
            if (this.board[j + k][i + k] != 2) {
              allSecondPlayer = false;
            }
          }
          if (allFirstPlayer) return 1;
          if (allSecondPlayer) return 2;
        }
        if (j - 3 >= 0 && i + 3 < 6) {
          let allFirstPlayer = true;
          let allSecondPlayer = true;
          for (let k = 0; k < 4; k++) {
            if (this.board[j - k][i + k] != 1) {
              allFirstPlayer = false;
            }
            if (this.board[j - k][i + k] != 2) {
              allSecondPlayer = false;
            }
          }
          if (allFirstPlayer) return 1;
          if (allSecondPlayer) return 2;
        }
      }
    }

    // draw
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 6; j++) {
        if (this.board[i][j] == 0) {
          return -1;
        }
      }
    }
    return 0;
  }
}
