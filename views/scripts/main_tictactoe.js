(function () {
  var socket = io("/tictactoe");

  console.log("started");

  $(document).ready(function () {
    let player = {
      sesID: JSON.parse($("#sesid").text()),
      name: JSON.parse($("#nick").text()),
      myTurn: false,
      myRoom: NaN,
      player: NaN
    };

    $("#new").on("click", () => {
      console.log("user " + player.name + "wants to create new tictactoe room");
      socket.emit("createRoom", {name: player.name, sesID: player.sesID} );
    });

    $("button[data-roomID]").on("click", (event) => {
      console.log("user " + player.name + "wants to jaoin a room");
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
      $("#tictactoe-board").css("display", "block"); //wyświetlenie planszy
      $("#upperLabel").text("Czekanie na przeciwnika..");
    });

    socket.on("cannotCreateRoom", (_) => {
      $('#cantJoin .modal-body').text("Nie można stworzyć pokoju.");
      $('#cantJoin').modal("show");
    });

    socket.on("cannotJoinRoom", (_) => {
      $('#cantJoin .modal-body').text("Nie można dołączyć do pokoju.");
      $('#cantJoin').modal("show");
    });

    socket.on("userHasLeft", (roomID) => {
      socket.emit("leaveRoom", {
        roomID: roomID,
        player: player.sesID,
        forced: true,
      });
      if (!$('#gameEndedModal').hasClass('show')) {
        $('#gameEndedModal .modal-body').text("O nie, Twój przeciwnik wyszedł z gry!");
        $('#gameEndedModal').modal("show");
      }
    });   

    socket.on("gameStarted", (data) => {
      console.log("game started" + data.you);
      player.player = data.you;
      player.myTurn = data.turn == player.player;
      if(player.myTurn) {
        $("#upperLabel").text("Wykonaj swój ruch");
      }
      else {
        $("#upperLabel").text("Zaczekaj na ruch przeciwnika..");
      }
    });

    socket.on("illegalMove", (data) => {
      console.log("illegal move");
      player.myTurn = player.player == data.turn;
    });

    socket.on("moveMade", (data) => {
      console.log("wykonał ruch na pos " + data.pos);
      console.log("teraz kolej " + data.turn);
      if(data.turn == 2){
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="80%" height="80%" fill="currentColor" class="bi bi-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      </svg>`);
      }
      else{
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`);
      }
      $(`#${data.pos}`).removeClass("has-hover");
      player.myTurn = data.turn == player.player;
      if(player.myTurn) {
        $("#upperLabel").text("Wykonaj swój ruch");
      }
      else {
        $("#upperLabel").text("Zaczekaj na ruch przeciwnika..");
      }
    });

    socket.on("gameEnded", (data) => {
      console.log("wykonał ruch na pos " + data.pos);
      console.log("gra zakończona");
      if(data.turn == 2){
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="80%" height="80%" fill="currentColor" class="bi bi-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      </svg>`);
      
      }
      else{
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`);
      }
      $(`#${data.pos}`).removeClass("has-hover");
      console.log("end " + data.end);

      if(data.won == 0) {
        $('#gameEndedModal .modal-body').text("Remis!");
      }
      else if (data.turn == player.player){
        $('#gameEndedModal .modal-body').text("Niestety, przegrałeś. Powodzenia następnym razem");
      }
      else {
        $('#gameEndedModal .modal-body').text("Gratulacje! Wygrałeś!");
      }      
      $('#gameEndedModal').modal("show");
    });


    $(".tictactoe-box").on("click", (event) => {
      if(player.myTurn && event.target.id){
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
