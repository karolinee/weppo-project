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
      row1: NaN,
      col1: NaN,
      row2: NaN,
      col2: NaN,
      firstClick : false,
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
     // console.log(player.myTurn)
    });


    socket.on("moveMade", (data) => {
      //console.log('player moves', player.myTurn, data.turn, player.player)
      let loc1 = "" + data.pos[0] + data.pos[1]
      let loc2 = "" + data.pos[2] + data.pos[3]
      $(`#${loc1}`).css("background-color", "rgb(160,160,160")
      $(`#${loc1}`).css("border-radius", "0px")
      if (data.board[data.pos[2]][data.pos[3]] == 1) {
        $(`#${loc2}`).css("background-color", "rgb(20,60,160")
        $(`#${loc2}`).css("border-radius", "50px")
      }
      if (data.board[data.pos[2]][data.pos[3]] == 3) {
        $(`#${loc2}`).css("background-color", "rgb(90,200,180")
        $(`#${loc2}`).css("border-radius", "20px")
      }
      if (data.board[data.pos[2]][data.pos[3]] == 2) {
        $(`#${loc2}`).css("background-color", "rgb(250,140,160")
        $(`#${loc2}`).css("border-radius", "50px")
      }
      if (data.board[data.pos[2]][data.pos[3]] == 4) {
        $(`#${loc2}`).css("background-color", "rgb(190,37,37")
        $(`#${loc2}`).css("border-radius", "20px")
      }
      //capture
      if(Math.abs(data.pos[0] - data.pos[2]) == 2){
        let loc_cap_x = (data.pos[0]+data.pos[2])/2
        let loc_cap_y = (data.pos[1]+data.pos[3])/2
        let loc_cap = ""+loc_cap_x + loc_cap_y
        $(`#${loc_cap}`).css("background-color", "rgb(160,160,160")
        $(`#${loc_cap}`).css("border-radius", "0px")
      }

      player.myTurn = (data.turn == player.player);
     // console.log('change player', player.myTurn)
      if (player.myTurn) {
        $("#upperLabel").text("Wykonaj swój ruch");
      } else {
        $("#upperLabel").text("Zaczekaj na ruch przeciwnika..");
      }
    });

    socket.on("gameEnded", (data) => {
      console.log("game ended won: " + data.won);

    let loc1 = "" + data.pos[0] + data.pos[1]
    let loc2 = "" + data.pos[2] + data.pos[3]
    $(`#${loc1}`).css("background-color", "rgb(160,160,160")
    $(`#${loc1}`).css("border-radius", "0px")
    if (data.board[data.pos[2]][data.pos[3]] == 1) {
      $(`#${loc2}`).css("background-color", "rgb(20,60,160")
      $(`#${loc2}`).css("border-radius", "50px")
    }
    if (data.board[data.pos[2]][data.pos[3]] == 3) {
      $(`#${loc2}`).css("background-color", "rgb(90,200,180")
      $(`#${loc2}`).css("border-radius", "20px")
    }
    if (data.board[data.pos[2]][data.pos[3]] == 2) {
      $(`#${loc2}`).css("background-color", "rgb(250,140,160")
      $(`#${loc2}`).css("border-radius", "50px")
    }
    if (data.board[data.pos[2]][data.pos[3]] == 4) {
      $(`#${loc2}`).css("background-color", "rgb(190,37,37")
      $(`#${loc2}`).css("border-radius", "20px")
    }
    //capture
    if(Math.abs(data.pos[0] - data.pos[2]) == 2){
      let loc_cap_x = (data.pos[0]+data.pos[2])/2
      let loc_cap_y = (data.pos[1]+data.pos[3])/2
      let loc_cap = ""+loc_cap_x + loc_cap_y
      $(`#${loc_cap}`).css("background-color", "rgb(160,160,160")
      $(`#${loc_cap}`).css("border-radius", "0px")
    }

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
      event.stopPropagation();
      //console.log('playing', player.player, player.myTurn)
      if (!player.firstClick) {
        player.row1 = parseInt(event.target.id.charAt(0), 10);
        player.col1 = parseInt(event.target.id.charAt(1), 10);

      }
      if (player.myTurn )
        player.firstClick = !player.firstClick
      //console.log('first clicked in ' + event.target.id, player.row1, player.col1)

      $(".draughts-box-black").on("click", (event) => {
       // console.log('first in second', player.row1, player.col1)
        player.row2 = parseInt(event.target.id.charAt(0), 10);
        player.col2 = parseInt(event.target.id.charAt(1), 10);
        if (player.myTurn) {
          player.myTurn = false;
          //console.log('2 click', row2, ' ', col2)
         // console.log([player.row1, player.col1, player.row2, player.col2])
          socket.emit("checkMoves", {
            player: player.player,
            roomID: player.myRoom,
            pos: [player.row1, player.col1, player.row2, player.col2]
          })
        }
      })

    });

    $(".tictactoe-box").on("click", (event) => {

      if (player.myTurn && event.target.id) {
        player.myTurn = false;
        socket.emit("madeTurn", {
          roomID: player.myRoom,
          player: player.player,
          pos: event.target.id,
        })
      }
    });


  });
})();