(function () {
  var socket = io("/draughts");

  console.log("started");

  $(document).ready(function () {
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
      player.myRoom = data.roomID;
      $("#buttonNickChange").css("visibility", "hidden");
      $("#buttonsToHide").css("visibility", "hidden");
      $(".list-group").css("display", "none"); //ukrycie pokoi
      $("#draughts-board").css("display", "block"); //wyświetlenie planszy
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
      player.myTurn = data.turn == player.player
      if (player.myTurn) {
        $("#upperLabel").text("Wykonaj swój ruch");
      } else {
        $("#upperLabel").text("Zaczekaj na ruch przeciwnika..");
      }


      console.log(data.board)
      for (let row in data.board) { 
        for (let column in data.board[row]) { 

          if (data.board[row][column] == 1) {
            //console.log(data.board[row][column])
            var loc = row.toString().concat(column.toString()) 
            //console.log(loc)//starting position
            var new_loc = loc.toString()
            $(`#${loc}`).css("background-color", "rgb(20,60,160")
            $(`#${loc}`).css("border-radius", "50px")  
            
          } else if (data.board[row][column] == 2) {
            var loc = row.toString().concat(column.toString()) 
            $(`#${loc}`).css("background-color", "rgb(250,140,160")
            $(`#${loc}`).css("border-radius", "50px")

          }
        }

      }

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

    $(".draughts-box-black").on("click", (event) => {
      if (player.myTurn) {
        player.myTurn = false;
        console.log('clicked in ' + event.target.id)
        socket.emit("madeTurn", {
          roomID: player.myRoom,
          pos: event.target.id,
        })
      }
    });


  });
})();