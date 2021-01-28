(function () {
  var socket = io("/4connect");

  console.log("started");

  $(document).ready(function () {
    var translateColumn = new Map();
    translateColumn.set(0, "a");
    translateColumn.set(1, "b");
    translateColumn.set(2, "c");
    translateColumn.set(3, "d");
    translateColumn.set(4, "e");
    translateColumn.set(5, "f");
    translateColumn.set(6, "g");
    let player = {
      sesID: JSON.parse($("#sesid").text()),
      name: JSON.parse($("#nick").text()),
      myTurn: false,
      myRoom: NaN,
      player: NaN,
    };

    $("#new").on("click", function () {
      console.log("new room button");
      $("#variableJSON").remove();
      console.log(player.name);
      socket.emit("createRoom", { name: player.name, sesID: player.sesID });
    });

    $("button[data-roomID]").on("click", (event) => {
      console.log("joining room");
      socket.emit("joinRoom", {
        roomID: $(event.target).data("roomid"),
        player: player.sesID,
        name: player.name,
      });
      player.myRoom = $(event.target).data("roomid");
    });

    socket.on("roomJoined", (data) => {
      $(".list-group").css("display", "none");
      $("#game-board").css("display", "block");
      player.myRoom = data.roomID;
    });

    socket.on("cannotCreateRoom", (_) => {
      console.log("cannot create room");
    });

    socket.on("cannotJoinRoom", (_) => {
      console.log("cannot join this room");
    });

    socket.on("user has left", (roomID) => {
      socket.emit("leaveRoom", {
        roomID: roomID,
        player: player.sesID,
        forced: true,
      });
    });

    socket.on("gameStarted", (data) => {
      console.log("game started" + data.you);
      player.player = data.you;
      player.myTurn = data.turn == player.player;
    });

    socket.on("illegalMove", (data) => {
      console.log("illegalMove " + data.turn);
      player.myTurn = player.player == data.turn;
    });

    socket.on("moveMade", (data) => {
      console.log("now moves " + data.turn);
      let id = translateColumn.get(data.column) + (data.row + 1);
      let color = data.turn == 1 ? "red" : "black";
      $(`#${id}`).attr("class", color);
      player.myTurn = data.turn == player.player;
    });

    socket.on("gameEnded", (data) => {
      console.log("game ended won: " + data.won);
      let id = translateColumn.get(data.column) + (data.row + 1);
      let color = data.turn == 1 ? "red" : "black";
      $(`#${id}`).attr("class", color);
      player.myTurn = false;
      //tutaj jakoś trzeba obwieścić kto wygrał
    });

    $("#columnOne").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 0,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $("#columnTwo").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 1,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $("#columnThree").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 2,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $("#columnFour").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 3,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $("#columnFive").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 4,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $("#columnSix").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 5,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $("#columnSeven").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 6,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
  });
})();
