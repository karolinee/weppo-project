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
    var sesID = JSON.parse($("#sesid").text());
    var name = JSON.parse($("#nick").text());
    var myTurn = false;
    var myRoom = sesID;
    var player;
    $("#new").on("click", function () {
      console.log("new room button");
      $("#variableJSON").remove();
      console.log(name);
      socket.emit("createRoom", { name: name, sesID: sesID });
      $(".list-group").css("display", "none");
      $("#game-board").css("display", "block");
    });

    $("button[data-roomID]").on("click", (event) => {
      console.log("joining room");
      socket.emit("joinRoom", {
        roomID: $(event.target).data("roomid"),
        player: sesID,
        name: name,
      });
      myRoom = $(event.target).data("roomid");
      $(".list-group").css("display", "none");
      $("#game-board").css("display", "block");
    });

    socket.on("user has left", (roomID) => {
      socket.emit("leaveRoom", {
        roomID: roomID,
        player: sesID,
        forced: true,
      });
    });

    socket.on("gameStarted", (data) => {
      console.log("game started" + data.you);
      player = data.you;
      myTurn = data.turn == player ? true : false;
    });

    socket.on("illegalMove", (_) => {
      console.log("illegalMove");
      myTurn = true;
    });

    socket.on("moveMade", (data) => {
      console.log("now moves " + data.turn);
      let id = translateColumn.get(data.column) + (data.row + 1);
      let color = data.turn == 1 ? "red" : "black";
      $(`#${id}`).attr("class", color);
      myTurn = data.turn == player;
    });

    socket.on("gameEnded", (data) => {
	console.log('game ended won: ' + data.won);
      let id = translateColumn.get(data.column) + (data.row + 1);
      let color = data.turn == 1 ? "red" : "black";
      $(`#${id}`).attr("class", color);
      myTurn = false;
      //tutaj jakoś trzeba obwieścić kto wygrał
    });

    $("#columnOne").on("click", (data) => {
      if (myTurn) {
        myTurn = false;
        socket.emit("madeTurn", {
          column: 0,
          roomID: myRoom,
        });
      }
    });
    $("#columnTwo").on("click", (data) => {
      if (myTurn) {
        myTurn = false;
        socket.emit("madeTurn", {
          column: 1,
          roomID: myRoom,
        });
      }
    });
    $("#columnThree").on("click", (data) => {
      if (myTurn) {
        myTurn = false;
        socket.emit("madeTurn", {
          column: 2,
          roomID: myRoom,
        });
      }
    });
    $("#columnFour").on("click", (data) => {
      if (myTurn) {
        myTurn = false;
        socket.emit("madeTurn", {
          column: 3,
          roomID: myRoom,
        });
      }
    });
    $("#columnFive").on("click", (data) => {
      if (myTurn) {
        myTurn = false;
        socket.emit("madeTurn", {
          column: 4,
          roomID: myRoom,
        });
      }
    });
    $("#columnSix").on("click", (data) => {
      if (myTurn) {
        myTurn = false;
        socket.emit("madeTurn", {
          column: 5,
          roomID: myRoom,
        });
      }
    });
    $("#columnSeven").on("click", (data) => {
      if (myTurn) {
        myTurn = false;
        socket.emit("madeTurn", {
          column: 6,
          roomID: myRoom,
        });
      }
    });
  });
})();
