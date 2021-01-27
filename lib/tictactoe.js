module.exports = function (io, rooms) {
  let nsp = io.of("/tictactoe");
  console.log("tictactoe io started");

  nsp.on("connection", (socket) => {
    console.log("A user connected to tictactoe!");

    socket.on("createRoom", (data) => {
      socket.join(data.sesID);
      roomsTictactoe = rooms.set(data.sesID, {
        room: data.sesID,
        name: data.name,
        player1: data.sesId,
        player2: NaN,
        size: 1,
        game: NaN,
      });
    });
    socket.on("joinRoom", (data) => {
      let room = rooms.get(data.roomID);
      socket.join(data.roomID);
      room.player2 = data.player;
      room.size = 2;
      room.game = new Game();
      rooms.set(data.roomID, room);
      socket.emit("gameStarted", {
        turn: room.game.turn,
        you: 2,
      });
      socket.to(data.roomID).emit("gameStarted", {
        turn: room.game.turn,
        you: 1,
      });
    });

    socket.on("disconnecting", (reason) => {
      for (let roomID of socket.rooms) {
        if (roomID != socket.id) {
          socket.to(roomID).emit("user has left", roomID);
          rooms.delete(roomID);
        }
      }
    });

    socket.on("leaveRoom", (data) => {
      if (!data.forced) {
        socket.to(data.roomID).emit("user has left", data.roomID);
        rooms4Connect.delete(data.roomID);
      }
      socket.leave(data.roomID);
    });

    socket.on("madeTurn", (data) => {
      let room = rooms.get(data.roomID);
      let move = room.game.move(data.pos);

      if(isNaN(move)){
        socket.emit("illegalMove");
      } else {
        let end = room.game.end();
        if(end == -1){
          nsp.to(data.roomID).emit("moveMade", {
            pos: data.pos,
            turn: room.game.turn,
          })
        } else {
          nsp.to(data.roomID).emit("gameEnded", {
            pos: data.pos,
            won: end,
            turn: room.game.turn,
          })
        }
      }

    })
  });
};

class Game{
  constructor(){
    this.turn = 1;
    this.board = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    this.moves = 0;
  }

  move(pos){
    let row = parseInt(pos.charAt(0), 10);
    let column = parseInt(pos.charAt(1), 10);
    if(this.board[row][column] == 0){
      this.board[row][column] = this.turn;
      this.turn = this.turn == 1 ? 2 : 1;
      this.moves += 1;
      return pos;
    }
    console.log(this.board);
    return NaN;
  }
  
  end(){
    // -1 -> game still goes on
    // 0 -> draw
    // 1 -> first player won
    // 2 -> second player won
    if(this.moves == 9) return 0;

    if(this.row(1) || this.column(1) || this.diagonal(1)) return 1;
    if(this.row(2) || this.column(2) || this.diagonal(2)) return 2;

    return -1;
  }

  row(player){
    for(let i = 0; i < 3; i++){
      if(this.board[i][0] == this.board[i][1] && 
        this.board[i][0] == this.board[i][2] &&
        this.board[i][0] == player) return true;
    }
    return false;
  }

  column(player){
    for(let i = 0; i < 3; i++){
      if(this.board[0][i] == this.board[1][i] && 
        this.board[0][i] == this.board[2][i] &&
        this.board[0][i] == player) return true;
    }
    return false;
  }

  diagonal(player){
    if(this.board[0][0] == this.board[1][1] && 
      this.board[0][0] == this.board[2][2] && 
      this.board[0][0] == player) return true;
    
    if(this.board[0][2] == this.board[1][1] && 
      this.board[0][2] == this.board[2][0] && 
      this.board[0][2] == player) return true;
      
    return false;
  }


}
