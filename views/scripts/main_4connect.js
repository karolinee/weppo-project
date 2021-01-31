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
      socket.emit("createRoom", {
        name: player.name,
        sesID: player.sesID,
        nick: player.name,
      });
    });

    $("button[data-roomID]").on("click", (event) => {
      console.log("joining room");
      socket.emit("joinRoom", {
        roomID: $(event.target).data("roomid"),
        player: player.sesID,
        nick: player.name,
      });
      player.myRoom = $(event.target).data("roomid");
    });

    socket.on("roomJoined", (data) => {
      player.myRoom = data.roomID;
      $("#buttonNickChange").css("visibility", "hidden");
      $("#buttonsToHide").css("visibility", "hidden");
      $(".list-group").css("display", "none"); //ukrycie pokoi
      $("#connect-board").css("display", "block"); //wyświetlenie planszy
      $("#upperLabel").text("Czekanie na przeciwnika..");
    });

    socket.on("cannotCreateRoom", (_) => {
      $("#cantJoin .modal-body").text("Nie można stworzyć pokoju.");
      $("#cantJoin").modal("show");
    });

    socket.on("cannotJoinRoom", (_) => {
      $("#cantJoin .modal-body").text("Nie można dołączyć do pokoju.");
      $("#cantJoin").modal("show");
    });

    socket.on("userHasLeft", (roomID) => {
      socket.emit("leaveRoom", {
        roomID: roomID,
        player: player.sesID,
        forced: true,
      });
      if (!$("#gameEndedModal").hasClass("show")) {
        $("#gameEndedModal .modal-body").text(
          "O nie, Twój przeciwnik wyszedł z gry!"
        );
        $("#gameEndedModal").modal("show");
      }
    });

    socket.on("gameStarted", (data) => {
      console.log("game started" + data.you);
      player.player = data.you;
      player.myTurn = data.turn == player.player;
      if (player.myTurn) {
        $("#upperLabel").text("Wykonaj swój ruch");
      } else {
        $("#upperLabel").text("Zaczekaj na ruch przeciwnika..");
      }
      console.log(data.opponent); //Tutaj wypisuje nick oponenta
    });

    socket.on("illegalMove", (data) => {
      console.log("illegalMove " + data.turn);
      player.myTurn = player.player == data.turn;
    });

    socket.on("moveMade", (data) => {
      console.log("now moves " + data.turn);
      let id = "" + data.column + data.row;
      let color = data.turn == 2 ? "red" : "yellow";
      $(`#${id}`).css("background-color", color);
      player.myTurn = data.turn == player.player;
      if (player.myTurn) {
        $("#upperLabel").text("Wykonaj swój ruch");
      } else {
        $("#upperLabel").text("Zaczekaj na ruch przeciwnika..");
      }
    });

    socket.on("gameEnded", (data) => {
      console.log("game ended won: " + data.won);
      let id = "" + data.column + data.row;
      let color = data.turn == 2 ? "red" : "yellow";
      $(`#${id}`).css("background-color", color);
      player.myTurn = false;
      if (data.won == 0) {
        $("#gameEndedModal .modal-body").text("Remis!");
      } else if (data.turn == player.player) {
        $("#gameEndedModal .modal-body").text(
          "Niestety, przegrałeś. Powodzenia następnym razem"
        );
      } else {
        $("#gameEndedModal .modal-body").text("Gratulacje! Wygrałeś!");
      }
      $("#gameEndedModal").modal("show");
    });

    $(".4-connect-column-0").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 0,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $(".4-connect-column-1").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 1,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $(".4-connect-column-2").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 2,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $(".4-connect-column-3").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 3,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $(".4-connect-column-4").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 4,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $(".4-connect-column-5").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 5,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $(".4-connect-column-6").on("click", (data) => {
      if (player.myTurn) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          column: 6,
          roomID: player.myRoom,
          player: player.player,
        });
      }
    });
    $(".4-connect-column-0").hover(
      function () {
        console.log("hej");
        for (let idx = 0; idx < 6; idx++) {
          if (
            $(`#0${idx}`).css("background-color") == "rgb(255, 255, 255)" &&
            player.myTurn
          )
            $(`#0${idx}`).css("background-color", "rgb(230,230,230");
        }
      },
      function () {
        for (let idx = 0; idx < 6; idx++) {
          if ($(`#0${idx}`).css("background-color") == "rgb(230, 230, 230)")
            $(`#0${idx}`).css("background-color", "white");
        }
      }
    );
    $(".4-connect-column-1").hover(
      function () {
        console.log("hej");
        for (let idx = 0; idx < 6; idx++) {
          if (
            $(`#1${idx}`).css("background-color") == "rgb(255, 255, 255)" &&
            player.myTurn
          )
            $(`#1${idx}`).css("background-color", "rgb(230,230,230");
        }
      },
      function () {
        for (let idx = 0; idx < 6; idx++) {
          if ($(`#1${idx}`).css("background-color") == "rgb(230, 230, 230)")
            $(`#1${idx}`).css("background-color", "white");
        }
      }
    );
    $(".4-connect-column-2").hover(
      function () {
        console.log("hej");
        for (let idx = 0; idx < 6; idx++) {
          if (
            $(`#2${idx}`).css("background-color") == "rgb(255, 255, 255)" &&
            player.myTurn
          )
            $(`#2${idx}`).css("background-color", "rgb(230,230,230");
        }
      },
      function () {
        for (let idx = 0; idx < 6; idx++) {
          if ($(`#2${idx}`).css("background-color") == "rgb(230, 230, 230)")
            $(`#2${idx}`).css("background-color", "white");
        }
      }
    );
    $(".4-connect-column-3").hover(
      function () {
        console.log("hej");
        for (let idx = 0; idx < 6; idx++) {
          if (
            $(`#3${idx}`).css("background-color") == "rgb(255, 255, 255)" &&
            player.myTurn
          )
            $(`#3${idx}`).css("background-color", "rgb(230,230,230");
        }
      },
      function () {
        for (let idx = 0; idx < 6; idx++) {
          if ($(`#3${idx}`).css("background-color") == "rgb(230, 230, 230)")
            $(`#3${idx}`).css("background-color", "white");
        }
      }
    );
    $(".4-connect-column-4").hover(
      function () {
        console.log("hej");
        for (let idx = 0; idx < 6; idx++) {
          if (
            $(`#4${idx}`).css("background-color") == "rgb(255, 255, 255)" &&
            player.myTurn
          )
            $(`#4${idx}`).css("background-color", "rgb(230,230,230");
        }
      },
      function () {
        for (let idx = 0; idx < 6; idx++) {
          if ($(`#4${idx}`).css("background-color") == "rgb(230, 230, 230)")
            $(`#4${idx}`).css("background-color", "white");
        }
      }
    );
    $(".4-connect-column-5").hover(
      function () {
        console.log("hej");
        for (let idx = 0; idx < 6; idx++) {
          if (
            $(`#5${idx}`).css("background-color") == "rgb(255, 255, 255)" &&
            player.myTurn
          )
            $(`#5${idx}`).css("background-color", "rgb(230,230,230");
        }
      },
      function () {
        for (let idx = 0; idx < 6; idx++) {
          if ($(`#5${idx}`).css("background-color") == "rgb(230, 230, 230)")
            $(`#5${idx}`).css("background-color", "white");
        }
      }
    );
    $(".4-connect-column-6").hover(
      function () {
        console.log("hej");
        for (let idx = 0; idx < 6; idx++) {
          if (
            $(`#6${idx}`).css("background-color") == "rgb(255, 255, 255)" &&
            player.myTurn
          )
            $(`#6${idx}`).css("background-color", "rgb(230,230,230");
        }
      },
      function () {
        for (let idx = 0; idx < 6; idx++) {
          if ($(`#6${idx}`).css("background-color") == "rgb(230, 230, 230)")
            $(`#6${idx}`).css("background-color", "white");
        }
      }
    );
  });
})();
